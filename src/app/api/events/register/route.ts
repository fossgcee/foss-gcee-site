import { NextResponse } from "next/server";
import { addEventRegistration } from "@/services/event";
import { supabase } from "@/lib/supabase";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { sendEventRegistrationEmail } from "@/lib/mailer";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = rateLimit(`event-register:ip:${ip}`, 5, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a bit." },
        { status: 429, headers: { "Retry-After": Math.ceil((ipLimit.reset - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const { name, department, college, year, mobile, email, eventSlug, eventTitle } = body;

    if (!name || !department || !college || !year || !mobile || !email || !eventSlug) {
      return NextResponse.json({ success: false, error: "Required fields are missing" }, { status: 400 });
    }

    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("slug", eventSlug.toLowerCase())
      .maybeSingle();

    if (eventErr || !event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }
    if (event.status === "completed") {
      return NextResponse.json({ success: false, error: "Registrations are closed. This event has already concluded." }, { status: 400 });
    }

    // Check for duplicate registration
    const { data: existingReg, error: regErr } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", event.id)
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existingReg && !regErr) {
      return NextResponse.json({ success: false, error: "You are already registered for this event" }, { status: 400 });
    }

    await addEventRegistration(event.id, {
      name,
      department,
      college,
      year: parseInt(year),
      mobile,
      email,
    });

    // Send confirmation email asynchronously (fire-and-forget — don't block registration)
    sendEventRegistrationEmail(email, name, eventTitle || event.title).catch((err) => {
      console.warn("Mail ignored but registration saved:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Registration completed",
    });
  } catch (error: unknown) {
    console.error("Critical Registration Error:", error);
    return NextResponse.json({
      success: false,
      error: getErrorMessage(error),
    }, { status: 500 });
  }
}
