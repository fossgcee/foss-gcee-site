import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    const body = await req.json();
    const { eventId, email, action = "toggle" } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

    const checkinTag = `checkin:${eventId}`;

    if (action === "clear") {
      await supabase.from("feedbacks").delete().eq("event_name", checkinTag);
      return NextResponse.json({ success: true, message: "Check-ins cleared", checkedInCount: 0, checkedInEmails: [] });
    }

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();

    // Check if already checked in
    const { data: existingCheckin } = await supabase
      .from("feedbacks")
      .select("id")
      .eq("event_name", checkinTag)
      .eq("email", targetEmail)
      .maybeSingle();

    if (action === "uncheckin" || (action === "toggle" && existingCheckin)) {
      if (existingCheckin) {
        await supabase.from("feedbacks").delete().eq("id", existingCheckin.id);
      }
    } else {
      // Find participant details from event_registrations
      const { data: participant } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .eq("email", targetEmail)
        .maybeSingle();

      await supabase.from("feedbacks").insert({
        event_name: checkinTag,
        name: participant?.name || targetEmail,
        email: targetEmail,
        department: participant?.department || "General",
        year: participant?.year || 0,
        rating: 5,
        comments: JSON.stringify({
          college: participant?.college || "Government College of Engineering, Erode",
          mobile: participant?.mobile || "",
        }),
      });
    }

    // Return updated checkins list
    const { data: allCheckins } = await supabase
      .from("feedbacks")
      .select("email")
      .eq("event_name", checkinTag);

    const checkedInEmails = (allCheckins || []).map((c) => (c.email || "").toLowerCase());

    return NextResponse.json({
      success: true,
      checkedIn: checkedInEmails.includes(targetEmail),
      checkedInCount: checkedInEmails.length,
      checkedInEmails,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
