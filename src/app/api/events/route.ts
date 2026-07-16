import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";


/**
 * Returns today's date string in "YYYY-MM-DD" format using IST (UTC+5:30).
 * This avoids UTC-midnight off-by-one errors for Indian users.
 */
function todayIST(): string {
  const now = new Date();
  // Shift to IST (+5:30 = +330 min)
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    // todayIST import was removed since it is unused

    // Fetch all non-draft events, newest first
    const events = await Event.find({ status: { $ne: "draft" } }).sort({ startDate: -1 });

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: unknown) {
    console.error("Fetch Events Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to load events.",
    }, { status: 500 });
  }
}
