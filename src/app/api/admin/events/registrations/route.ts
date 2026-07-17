import { NextResponse } from "next/server";
import { getEventRegistrations } from "@/services/event";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";

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

    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventSlug.toLowerCase())
      .maybeSingle();

    if (eventErr || !event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const regs = await getEventRegistrations(event.id);

    return NextResponse.json({
      success: true,
      count: regs.length,
      data: regs,
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

    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventSlug.toLowerCase())
      .maybeSingle();

    if (eventErr || !event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const { error: delErr } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", event.id)
      .eq("email", email.toLowerCase().trim());

    if (delErr) throw delErr;

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
