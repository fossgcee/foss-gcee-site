import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET() {
  try {
    await dbConnect();
    // Sort events by startDate descending
    const events = await Event.find({ status: { $ne: "draft" } }).sort({ startDate: -1 });

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: any) {
    console.error("Fetch Events Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
