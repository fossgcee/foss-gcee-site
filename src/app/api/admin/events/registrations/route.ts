import { NextResponse } from "next/server";
import { getEventRegistrations } from "@/services/event";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";
import { emailRegex } from "@/lib/utils";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

type CsvRow = Record<string, string>;

type ParticipantImportRow = {
  event_id: string;
  name: string;
  department: string;
  college: string;
  year: number;
  mobile: string;
  email: string;
};

const splitCsvLine = (line: string) => {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const parseCsv = (content: string): CsvRow[] => {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce<CsvRow>((row, header, index) => {
      row[header] = cells[index]?.trim() || "";
      return row;
    }, {});
  });
};

// Clean a string down to lowercase alphanumeric characters only
const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Robust fuzzy column detector that handles typos (e.g. "Brach", "Which Year", "Year of Study ?")
const getColumnValue = (
  row: CsvRow,
  fieldType: "name" | "email" | "year" | "department" | "college" | "mobile" | "roll_no"
): string => {
  const keys = Object.keys(row);

  // First pass: look for high-confidence header matches
  for (const key of keys) {
    const val = (row[key] || "").trim();
    if (!val) continue;

    const raw = key.toLowerCase().trim();
    const clean = cleanStr(key);

    switch (fieldType) {
      case "email": {
        if (
          clean.includes("email") ||
          clean.includes("mailid") ||
          clean.includes("e_mail") ||
          raw === "mail" ||
          raw.startsWith("email") ||
          clean.includes("emailaddress")
        ) {
          return val;
        }
        break;
      }

      case "name": {
        // Negative checks: exclude headers referencing college, department, event, file
        if (
          clean.includes("college") ||
          clean.includes("department") ||
          clean.includes("dept") ||
          clean.includes("event") ||
          clean.includes("file") ||
          clean.includes("institution") ||
          clean.includes("organization") ||
          clean.includes("company")
        ) {
          continue;
        }

        if (
          clean === "name" ||
          /^name\d*$/.test(clean) || // Name, Name1, Name2
          clean.includes("fullname") ||
          clean.includes("studentname") ||
          clean.includes("participantname") ||
          clean.includes("attendeename") ||
          clean.includes("candidatename") ||
          clean.includes("personname") ||
          clean.startsWith("name") ||
          clean.endsWith("name")
        ) {
          return val;
        }
        break;
      }

      case "year": {
        // Exclude event-level date headers
        if (clean.includes("eventyear") || clean.includes("startyear")) {
          continue;
        }

        if (
          clean.includes("yearofstudy") ||
          clean.includes("whichyear") ||
          clean.includes("studyyear") ||
          clean.includes("currentyear") ||
          clean.includes("classyear") ||
          clean.includes("collegeyear") ||
          clean.includes("pursuingyear") ||
          clean.includes("academicyear") ||
          clean.includes("graduatingyear") ||
          clean.includes("batchyear") ||
          clean.includes("yrofstudy") ||
          clean.includes("whichyr") ||
          clean.includes("studyyrs") ||
          clean === "year" ||
          clean === "yr" ||
          clean === "class" ||
          clean === "standard" ||
          clean.includes("year") ||
          clean.includes("yaer") || // common typo: "yaer"
          clean.includes("yeaer") ||
          clean.includes("yeer")
        ) {
          return val;
        }
        break;
      }

      case "department": {
        if (
          clean.includes("dept") ||
          clean.includes("department") ||
          clean.includes("depart") ||
          clean.includes("branch") ||
          clean.includes("brach") || // common typo: "brach"
          clean.includes("stream") ||
          clean.includes("course") ||
          clean.includes("major") ||
          clean.includes("specialization") ||
          clean.includes("programme") ||
          clean.includes("discipline") ||
          clean.includes("fieldofstudy")
        ) {
          return val;
        }
        break;
      }

      case "college": {
        if (
          clean.includes("college") ||
          clean.includes("institution") ||
          clean.includes("institute") ||
          clean.includes("university") ||
          clean.includes("campus") ||
          clean.includes("organisation") ||
          clean.includes("organization") ||
          clean.includes("school") ||
          clean.includes("company")
        ) {
          return val;
        }
        break;
      }

      case "mobile": {
        if (
          clean.includes("mobile") ||
          clean.includes("phone") ||
          clean.includes("whatsapp") ||
          clean.includes("contact") ||
          clean.includes("cell") ||
          clean.includes("phno") ||
          clean.includes("telephone") ||
          clean.includes("mob")
        ) {
          return val;
        }
        break;
      }

      case "roll_no": {
        if (
          clean.includes("roll") ||
          clean.includes("regno") ||
          clean.includes("registerno") ||
          clean.includes("regnumber") ||
          clean.includes("rollnumber") ||
          clean.includes("registrationnumber") ||
          clean.includes("usn")
        ) {
          return val;
        }
        break;
      }
    }
  }

  // Fallback for email: check if any cell value is a valid email
  if (fieldType === "email") {
    for (const key of keys) {
      const val = (row[key] || "").trim();
      if (val && emailRegex.test(val.toLowerCase())) {
        return val;
      }
    }
  }

  return "";
};

const normalizeYear = (value: string): number => {
  if (!value) return 0;
  const raw = value.trim().toLowerCase();

  // 1. Words and roman numerals
  if (/\b(4th|fourth|final|iv)\b/i.test(raw)) return 4;
  if (/\b(3rd|third|pre-?final|iii)\b/i.test(raw)) return 3;
  if (/\b(2nd|second|sophomore|ii)\b/i.test(raw)) return 2;
  if (/\b(1st|first|freshman|i)\b/i.test(raw)) return 1;

  // 2. Number + suffix (e.g., "4th Year", "2 nd", "Year 3")
  const match = raw.match(/\b([1-5])(?:\s*(?:st|nd|rd|th))?(?:\s*year)?\b/);
  if (match) {
    const num = Number.parseInt(match[1], 10);
    if (num >= 1 && num <= 5) return num;
  }

  // 3. Any isolated digit
  const anyDigit = raw.match(/\d+/);
  if (anyDigit) {
    const num = Number.parseInt(anyDigit[0], 10);
    if (num >= 1 && num <= 5) return num;
    // 4-digit graduation year
    if (num >= 2024 && num <= 2030) {
      const currentYear = new Date().getFullYear();
      const calcYear = 4 - (num - currentYear);
      if (calcYear >= 1 && calcYear <= 4) return calcYear;
    }
  }

  return 0;
};

const normalizeImportRows = (rows: CsvRow[], eventId: string) => {
  const seen = new Set<string>();
  const skipped: string[] = [];
  const participants: ParticipantImportRow[] = [];

  rows.forEach((row, index) => {
    const name = getColumnValue(row, "name");
    const rawEmail = getColumnValue(row, "email");
    const email = rawEmail.toLowerCase().trim();

    if (!name || !emailRegex.test(email)) {
      skipped.push(`Row ${index + 2}`);
      return;
    }

    if (seen.has(email)) return;
    seen.add(email);

    const yearVal = getColumnValue(row, "year");
    const parsedYear = normalizeYear(yearVal);
    const department = getColumnValue(row, "department") || "External RSVP";
    const college = getColumnValue(row, "college") || "Government College of Engineering, Erode";
    const mobile = getColumnValue(row, "mobile");

    participants.push({
      event_id: eventId,
      name,
      email,
      mobile,
      department,
      college,
      year: parsedYear,
    });
  });

  return { participants, skipped };
};

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get('eventSlug');
    const eventId = searchParams.get('eventId') || searchParams.get('id');

    if (!eventSlug && !eventId) {
      return NextResponse.json({ success: false, error: "Event slug or ID is required" }, { status: 400 });
    }

    let query = supabase.from("events").select("id, title, slug, start_date, venue, registration_mode, external_rsvp_url, registrations_count");
    if (eventId) {
      query = query.eq("id", eventId);
    } else if (eventSlug) {
      query = query.eq("slug", eventSlug.toLowerCase());
    }

    const { data: event, error: eventErr } = await query.maybeSingle();

    if (eventErr || !event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const regs = await getEventRegistrations(event.id);

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        startDate: event.start_date,
        venue: event.venue,
        registrationMode: event.registration_mode,
        externalRsvpUrl: event.external_rsvp_url,
        registrationsCount: regs.length,
      },
      count: regs.length,
      data: regs,
    });
  } catch (error: unknown) {
    console.error("Fetch Event Registrations Error:", error);
    return NextResponse.json({
      success: false,
      error: getErrorMessage(error),
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. Handle JSON manual participant addition
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const eventSlug = body.eventSlug;
      const eventId = body.eventId || body.id;
      const participant = body.participant;

      if ((!eventSlug && !eventId) || !participant) {
        return NextResponse.json({ success: false, error: "Event and participant data are required" }, { status: 400 });
      }

      let query = supabase.from("events").select("id, slug, title");
      if (eventId) {
        query = query.eq("id", eventId);
      } else {
        query = query.eq("slug", eventSlug.toLowerCase());
      }

      const { data: event, error: eventErr } = await query.maybeSingle();
      if (eventErr || !event) {
        return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
      }

      const name = (participant.name || "").trim();
      const email = (participant.email || "").toLowerCase().trim();

      if (!name) {
        return NextResponse.json({ success: false, error: "Participant name is required" }, { status: 400 });
      }
      if (!emailRegex.test(email)) {
        return NextResponse.json({ success: false, error: "A valid email address is required" }, { status: 400 });
      }

      const payload = {
        event_id: event.id,
        name,
        email,
        department: (participant.department || "").trim() || "General",
        college: (participant.college || "").trim() || "Government College of Engineering, Erode",
        year: Number(participant.year) || 0,
        mobile: (participant.mobile || "").trim(),
      };

      const { error: upsertErr } = await supabase
        .from("event_registrations")
        .upsert(payload, { onConflict: "event_id,email" });

      if (upsertErr) throw upsertErr;

      const regs = await getEventRegistrations(event.id);

      return NextResponse.json({
        success: true,
        message: "Participant saved successfully",
        data: {
          registrations: regs,
          count: regs.length,
        },
      });
    }

    // 2. Handle Multipart CSV file upload
    const formData = await request.formData();
    const eventSlug = String(formData.get("eventSlug") || "");
    const eventId = String(formData.get("eventId") || formData.get("id") || "");
    const file = formData.get("file");

    if ((!eventSlug && !eventId) || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Event identifier and CSV file are required" }, { status: 400 });
    }

    let query = supabase.from("events").select("id, slug, title");
    if (eventId) {
      query = query.eq("id", eventId);
    } else {
      query = query.eq("slug", eventSlug.toLowerCase());
    }

    const { data: event, error: eventErr } = await query.maybeSingle();

    if (eventErr || !event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const csv = await file.text();
    const { participants, skipped } = normalizeImportRows(parseCsv(csv), event.id);

    if (participants.length === 0) {
      return NextResponse.json({ success: false, error: "No valid participants found in CSV" }, { status: 400 });
    }

    const emails = participants.map((participant) => participant.email);
    const { data: existingRows, error: existingErr } = await supabase
      .from("event_registrations")
      .select("email")
      .eq("event_id", event.id)
      .in("email", emails);

    if (existingErr) throw existingErr;

    const existing = new Set((existingRows || []).map((row) => row.email));
    const inserts = participants.filter((participant) => !existing.has(participant.email));
    const updates = participants.filter((participant) => existing.has(participant.email));

    if (inserts.length > 0) {
      const { error: insertErr } = await supabase.from("event_registrations").insert(inserts);
      if (insertErr) throw insertErr;
    }

    for (const participant of updates) {
      const { error: updateErr } = await supabase
        .from("event_registrations")
        .update({
          name: participant.name,
          department: participant.department,
          college: participant.college,
          year: participant.year,
          mobile: participant.mobile,
        })
        .eq("event_id", event.id)
        .eq("email", participant.email);

      if (updateErr) throw updateErr;
    }

    const regs = await getEventRegistrations(event.id);

    return NextResponse.json({
      success: true,
      message: `Imported ${inserts.length} new and updated ${updates.length} existing participants`,
      data: {
        inserted: inserts.length,
        updated: updates.length,
        skipped: skipped.length,
        skippedRows: skipped,
        registrations: regs,
        count: regs.length,
      },
    });
  } catch (error: unknown) {
    console.error("Import Event Registrations Error:", error);
    return NextResponse.json({
      success: false,
      error: getErrorMessage(error),
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get('eventSlug');
    const eventId = searchParams.get('eventId') || searchParams.get('id');
    const email = searchParams.get('email');

    if ((!eventSlug && !eventId) || !email) {
      return NextResponse.json({ success: false, error: "Event identifier and email are required" }, { status: 400 });
    }

    let query = supabase.from("events").select("id");
    if (eventId) {
      query = query.eq("id", eventId);
    } else if (eventSlug) {
      query = query.eq("slug", eventSlug.toLowerCase());
    }

    const { data: event, error: eventErr } = await query.maybeSingle();

    if (eventErr || !event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const { error: delErr } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", event.id)
      .eq("email", email.toLowerCase().trim());

    if (delErr) throw delErr;

    return NextResponse.json({
      success: true,
      message: "Participant removed successfully",
    });
  } catch (error: unknown) {
    console.error("Delete Event Registration Error:", error);
    return NextResponse.json({
      success: false,
      error: getErrorMessage(error),
    }, { status: 500 });
  }
}
