import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSiteConfig, updateSiteConfig } from "@/services/siteConfig";
import { supabase } from "@/lib/supabase";

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

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    const body = await req.json();
    const { eventId, email, action = "toggle" } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

    const checkinConfigKey = `checkin_${eventId}`;
    const currentConfig = (await getSiteConfig(checkinConfigKey)) as EventCheckinConfig | null;
    let checkins: CheckinRecord[] = currentConfig?.checkins ? [...currentConfig.checkins] : [];

    if (action === "clear") {
      await updateSiteConfig(checkinConfigKey, { checkins: [] });
      return NextResponse.json({ success: true, message: "Check-ins cleared", checkins: [] });
    }

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();
    const existingIndex = checkins.findIndex((c) => c.email.toLowerCase() === targetEmail);

    if (action === "uncheckin" || (action === "toggle" && existingIndex >= 0)) {
      if (existingIndex >= 0) {
        checkins.splice(existingIndex, 1);
      }
    } else {
      // Find participant details from event_registrations
      const { data: participant } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .eq("email", targetEmail)
        .maybeSingle();

      const newRecord: CheckinRecord = {
        email: targetEmail,
        name: participant?.name || targetEmail,
        department: participant?.department || "General",
        year: participant?.year || 0,
        college: participant?.college || "Government College of Engineering, Erode",
        mobile: participant?.mobile || "",
        checkedInAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        checkins[existingIndex] = newRecord;
      } else {
        checkins.push(newRecord);
      }
    }

    await updateSiteConfig(checkinConfigKey, { checkins });

    return NextResponse.json({
      success: true,
      checkedIn: checkins.some((c) => c.email.toLowerCase() === targetEmail),
      checkins,
      checkedInCount: checkins.length,
      checkedInEmails: checkins.map((c) => c.email.toLowerCase()),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
