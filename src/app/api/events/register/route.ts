import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
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

    await dbConnect();
    const body = await request.json();
    const { name, department, college, year, mobile, email, eventSlug, eventTitle } = body;

    if (!name || !department || !college || !year || !mobile || !email || !eventSlug) {
      return NextResponse.json({ success: false, error: "Required fields are missing" }, { status: 400 });
    }

    const event = await Event.findOne({ slug: eventSlug.toLowerCase() });
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }
    if (event.status === "completed") {
      return NextResponse.json({ success: false, error: "Registrations are closed. This event has already concluded." }, { status: 400 });
    }

    // Check for duplicate registration
    const registrations = (event.registrations || []) as Array<{ email: string }>;
    const isDuplicate = registrations.some((r) => r.email === email);
    if (isDuplicate) {
      return NextResponse.json({ success: false, error: "You are already registered for this event" }, { status: 400 });
    }

    const regEntry = {
      name,
      department,
      college,
      year: parseInt(year),
      mobile,
      email,
      registeredAt: new Date(),
    };

    // Use push within updateOne to ensure it goes into the correct document
    await Event.updateOne(
      { slug: eventSlug.toLowerCase() },
      { 
        $push: { registrations: regEntry },
        $inc: { registrationsCount: 1 }
      }
    );

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
