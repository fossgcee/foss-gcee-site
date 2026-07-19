import { NextResponse } from "next/server";
import { getEvents } from "@/services/event";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all events, newest first
    const events = await getEvents();

    // Filter out draft status
    const nonDraftEvents = events.filter(e => e.status !== "draft");

    return NextResponse.json({
      success: true,
      count: nonDraftEvents.length,
      data: nonDraftEvents,
    });
  } catch (error: unknown) {
    console.error("Fetch Events Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to load events.",
    }, { status: 500 });
  }
}
