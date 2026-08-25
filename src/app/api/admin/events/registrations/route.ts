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

const readColumn = (row: CsvRow, names: string[]) => {
  for (const name of names) {
    const value = row[name.toLowerCase()];
    if (value) return value.trim();
  }
  return "";
};

const normalizeYear = (value: string) => {
  const match = value.match(/\d+/);
  if (!match) return 0;
  const year = Number.parseInt(match[0], 10);
  return Number.isFinite(year) ? year : 0;
};

const normalizeImportRows = (rows: CsvRow[], eventId: string) => {
  const seen = new Set<string>();
  const skipped: string[] = [];
  const participants: ParticipantImportRow[] = [];

  rows.forEach((row, index) => {
    const name = readColumn(row, ["name", "name1", "full name", "fullname", "participant name", "attendee name"]);
    const email = readColumn(row, ["email", "email address", "e-mail", "mail"]).toLowerCase();

    if (!name || !emailRegex.test(email)) {
      skipped.push(`Row ${index + 2}`);
      return;
    }

    if (seen.has(email)) return;
    seen.add(email);

    participants.push({
      event_id: eventId,
      name,
      email,
      mobile: readColumn(row, ["mobile", "phone", "phone number", "contact", "contact number", "whatsapp", "whatsapp number"]),
      department: readColumn(row, ["department", "dept", "branch", "course"]) || "External RSVP",
      college: readColumn(row, ["college", "institution", "organization", "organisation", "company"]) || "FOSS United RSVP",
      year: normalizeYear(readColumn(row, ["year", "year of study", "study year", "current year", "graduation year"])),
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

    if (!eventSlug) {
      return NextResponse.json({ success: false, error: "Event slug is required" }, { status: 400 });
    }

    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventSlug.toLowerCase())
      .maybeSingle();

    if (eventErr || !event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const regs = await getEventRegistrations(event.id);

    return NextResponse.json({
      success: true,
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
    const formData = await request.formData();
    const eventSlug = String(formData.get("eventSlug") || "");
    const file = formData.get("file");

    if (!eventSlug || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Event slug and CSV file are required" }, { status: 400 });
    }

    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventSlug.toLowerCase())
      .maybeSingle();

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
    const email = searchParams.get('email');

    if (!eventSlug || !email) {
      return NextResponse.json({ success: false, error: "Event slug and email are required" }, { status: 400 });
    }

    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventSlug.toLowerCase())
      .maybeSingle();

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
