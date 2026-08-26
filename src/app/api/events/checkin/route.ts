import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { emailRegex } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CheckinRecord {
  email: string;
  name: string;
  department?: string;
  year?: number;
  college?: string;
  mobile?: string;
  checkedInAt: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventSlug = searchParams.get("eventSlug") || searchParams.get("slug");
    const eventId = searchParams.get("eventId") || searchParams.get("id");

    if (!eventSlug && !eventId) {
      return NextResponse.json({ success: false, error: "Event slug or ID is required" }, { status: 400 });
    }

    let query = supabase.from("events").select("id, title, slug, venue, start_date, start_time, registrations_count");
    if (eventId) {
      query = query.eq("id", eventId);
    } else if (eventSlug) {
      query = query.eq("slug", eventSlug.toLowerCase());
    }

    const { data: event, error: eventErr } = await query.maybeSingle();
    if (eventErr || !event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Get checkins from feedbacks table with event_name = 'checkin:' + event.id
    const { data: checkinRows } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("event_name", `checkin:${event.id}`)
      .order("created_at", { ascending: true });

    const checkins: CheckinRecord[] = (checkinRows || []).map((row) => {
      let meta: any = {};
      try {
        meta = JSON.parse(row.comments || "{}");
      } catch {
        meta = {};
      }
      return {
        email: (row.email || "").toLowerCase(),
        name: row.name || "",
        department: row.department || "",
        year: row.year || 0,
        college: meta.college || "Government College of Engineering, Erode",
        mobile: meta.mobile || "",
        checkedInAt: row.created_at,
      };
    });

    // Total registrations
    const { count: totalRegs } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id);

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        venue: event.venue,
        startDate: event.start_date,
        startTime: event.start_time,
        registrationsCount: totalRegs ?? event.registrations_count ?? 0,
      },
      totalRegistrations: totalRegs ?? event.registrations_count ?? 0,
      checkedInCount: checkins.length,
      checkedInEmails: checkins.map((c) => c.email.toLowerCase()),
      recentCheckins: [...checkins].reverse().slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventSlug = body.eventSlug || body.slug;
    const eventId = body.eventId || body.id;
    const email = (body.email || "").toLowerCase().trim();
    const name = (body.name || "").trim();
    const department = (body.department || "").trim() || "General";
    const year = Number(body.year) || 0;
    const college = (body.college || "").trim() || "Government College of Engineering, Erode";
    const mobile = (body.mobile || "").trim();
    const isSpotRegister = Boolean(body.spotRegister || body.isSpot);

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!eventSlug && !eventId) {
      return NextResponse.json({ success: false, error: "Event slug or ID is required." }, { status: 400 });
    }

    let query = supabase.from("events").select("id, title, slug, venue, start_date, start_time");
    if (eventId) {
      query = query.eq("id", eventId);
    } else {
      query = query.eq("slug", eventSlug.toLowerCase());
    }

    const { data: event, error: eventErr } = await query.maybeSingle();
    if (eventErr || !event) {
      return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
    }

    // 1. Check existing registration
    const { data: existingReg } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", event.id)
      .eq("email", email)
      .maybeSingle();

    let participantName = existingReg ? existingReg.name : name;
    let participantDept = existingReg ? existingReg.department : department;
    let participantYear = existingReg ? existingReg.year : year;
    let participantCollege = existingReg ? existingReg.college : college;
    let participantMobile = existingReg ? existingReg.mobile : mobile;

    // If not registered yet:
    if (!existingReg) {
      if (!isSpotRegister && !name) {
        return NextResponse.json(
          {
            success: false,
            notRegistered: true,
            error: "This email is not registered for this event yet. Please use Spot Registration.",
          },
          { status: 404 }
        );
      }

      if (!name) {
        return NextResponse.json({ success: false, error: "Name is required for spot registration." }, { status: 400 });
      }

      // Add to event_registrations
      const { error: insertErr } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        name,
        email,
        department,
        college,
        year,
        mobile,
      });

      if (insertErr) {
        console.error("Spot Registration Insert Error:", insertErr);
      }

      participantName = name;
      participantDept = department;
      participantYear = year;
      participantCollege = college;
      participantMobile = mobile;
    }

    // 2. Check if already recorded in checkins
    const checkinTag = `checkin:${event.id}`;
    const { data: existingCheckin } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("event_name", checkinTag)
      .eq("email", email)
      .maybeSingle();

    if (existingCheckin) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          venue: event.venue,
          startDate: event.start_date,
        },
        participant: {
          name: existingCheckin.name || participantName,
          email,
          department: existingCheckin.department || participantDept,
          year: existingCheckin.year || participantYear,
          college: participantCollege,
          checkedInAt: existingCheckin.created_at,
        },
      });
    }

    // Insert new check-in record
    const { data: inserted, error: checkinErr } = await supabase
      .from("feedbacks")
      .insert({
        event_name: checkinTag,
        name: participantName,
        email,
        department: participantDept,
        year: participantYear,
        rating: 5,
        comments: JSON.stringify({ college: participantCollege, mobile: participantMobile }),
      })
      .select()
      .single();

    if (checkinErr) {
      throw checkinErr;
    }

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        venue: event.venue,
        startDate: event.start_date,
      },
      participant: {
        name: participantName,
        email,
        department: participantDept,
        year: participantYear,
        college: participantCollege,
        checkedInAt: inserted.created_at,
      },
    });
  } catch (error) {
    console.error("Check-in Error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
