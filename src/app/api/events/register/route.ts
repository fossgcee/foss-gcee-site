import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, regNo, college, year, mobile, email, eventSlug } = body;

    if (!name || !regNo || !college || !year || !mobile || !email || !eventSlug) {
      return NextResponse.json({ success: false, error: "Required fields are missing" }, { status: 400 });
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
    const result = await Event.findOneAndUpdate(
      { slug: eventSlug.toLowerCase() }, // Ensure slug is lowercase for matching
      { 
        $push: { registrations: regEntry },
        $inc: { registrationsCount: 1 }
      },
      { new: true, runValidators: true }
    );

    if (!result) {
      return NextResponse.json({ success: false, error: "Event not found for this slug" }, { status: 404 });
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
