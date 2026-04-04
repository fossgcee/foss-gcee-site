import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

type RegistrationSummary = {
  registeredAt?: string | Date;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

export async function GET(request: Request) {
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
