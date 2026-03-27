import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, regNo, college, year, mobile, email, eventSlug, eventTitle } = body;

    if (!name || !regNo || !college || !year || !mobile || !email || !eventSlug) {
      return NextResponse.json({ success: false, error: "Required fields are missing" }, { status: 400 });
    }

    const event = await Event.findOne({ slug: eventSlug.toLowerCase() });
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Check for duplicate registration
    const isDuplicate = event.registrations.some((r: any) => r.email === email || r.regNo === regNo);
    if (isDuplicate) {
      return NextResponse.json({ success: false, error: "You are already registered for this event" }, { status: 400 });
    }

    const regEntry = {
      name,
      regNo,
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

    // Send confirmation email asynchronously
    try {
      const { sendEventRegistrationEmail } = await import("@/lib/mailer");
      await sendEventRegistrationEmail(email, name, eventTitle || event.title);
    } catch (err) {
      console.warn("Mail ignored but registration saved:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Registration completed",
    });
  } catch (error: any) {
    console.error("Critical Registration Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
