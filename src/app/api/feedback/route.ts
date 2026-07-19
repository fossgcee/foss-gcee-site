import { NextRequest, NextResponse } from "next/server";
import { createFeedback } from "@/services/feedback";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, year, department, eventName, rating, comments } = body;

    if (!eventName || !rating || !year || !department) {
      return NextResponse.json({ success: false, error: "Event name, rating, year and department are required." }, { status: 400 });
    }

    const newFeedback = await createFeedback({
      name,
      email,
      year: parseInt(year),
      department,
      eventName,
      rating,
      comments,
    });

    // Auto-register logic if participant provided email and name
    if (email && name) {
      const { data: event, error: eventErr } = await supabase
        .from("events")
        .select("id")
        .eq("title", eventName)
        .maybeSingle();

      if (event && !eventErr) {
        const { data: existingReg, error: regErr } = await supabase
          .from("event_registrations")
          .select("id")
          .eq("event_id", event.id)
          .eq("email", email)
          .maybeSingle();

        if (!existingReg && !regErr) {
          await supabase.from("event_registrations").insert({
            event_id: event.id,
            name,
            email,
            phone: "Unknown",
            college: "Government College of Engineering, Erode",
            year: parseInt(year),
            department,
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: newFeedback }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
