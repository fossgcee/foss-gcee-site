import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSiteConfig, updateSiteConfig } from "@/services/siteConfig";
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

interface EventCheckinConfig {
  checkins: CheckinRecord[];
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

    // Get checkins from site_configs
    const checkinConfigKey = `checkin_${event.id}`;
    const checkinData = (await getSiteConfig(checkinConfigKey)) as EventCheckinConfig | null;
    const checkins = checkinData?.checkins || [];

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

    // 2. Load check-in records for this event
    const checkinConfigKey = `checkin_${event.id}`;
    const currentConfig = (await getSiteConfig(checkinConfigKey)) as EventCheckinConfig | null;
    const checkins: CheckinRecord[] = currentConfig?.checkins ? [...currentConfig.checkins] : [];

    const existingIndex = checkins.findIndex((c) => c.email.toLowerCase() === email);
    const nowIso = new Date().toISOString();

    let alreadyCheckedIn = false;
    let checkedInAt = nowIso;

    if (existingIndex >= 0) {
      alreadyCheckedIn = true;
      checkedInAt = checkins[existingIndex].checkedInAt || nowIso;
    } else {
      const newRecord: CheckinRecord = {
        email,
        name: participantName,
        department: participantDept,
        year: participantYear,
        college: participantCollege,
        mobile: participantMobile,
        checkedInAt: nowIso,
      };
      checkins.push(newRecord);
      await updateSiteConfig(checkinConfigKey, { checkins });
    }

    return NextResponse.json({
      success: true,
      alreadyCheckedIn,
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
        checkedInAt,
      },
    });
  } catch (error) {
    console.error("Check-in Error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
