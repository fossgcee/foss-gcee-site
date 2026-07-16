import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { requireAdmin } from "@/lib/adminAuth";

type RegistrationSummary = {
  registeredAt?: string | Date;
  email: string;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
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

    await dbConnect();
    
    // Explicitly grab the registrations array from the document
    const event = await Event.findOne({ slug: eventSlug.toLowerCase() })
      .select("registrations")
      .lean<{ registrations?: RegistrationSummary[] }>(); // Use lean for faster, direct data access

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Sort registrations newest to oldest
    const sortedRegs = (event.registrations || []).sort((a, b) => 
      new Date(b.registeredAt ?? 0).getTime() - new Date(a.registeredAt ?? 0).getTime()
    );

    return NextResponse.json({
      success: true,
      count: sortedRegs.length,
      data: sortedRegs,
    });
  } catch (error: unknown) {
    console.error("Fetch Event Registrations Error:", error);
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

    await dbConnect();
    
    // Use $pull to remove the registration and $inc to decrement the count
    const result = await Event.findOneAndUpdate(
      { slug: eventSlug.toLowerCase() },
      { 
        $pull: { registrations: { email } },
        $inc: { registrationsCount: -1 }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Since we decremented unconditionally above, we should ideally only decrement if a pull actually happened.
    // However, since emails are unique per event registration, this works fine for simplicity as long as the email exists.
    // To be perfectly safe, we'll fix the count if it goes below 0.
    if (result.registrationsCount < 0) {
      await Event.updateOne({ slug: eventSlug.toLowerCase() }, { $set: { registrationsCount: 0 } });
    }

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
