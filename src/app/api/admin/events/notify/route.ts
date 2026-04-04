import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { sendBulkEmail } from "@/lib/mailer";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

type RegistrationSummary = {
  email?: string | null;
};

type EventSummary = {
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  registrations?: RegistrationSummary[];
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatEventWindow = (event: EventSummary) => {
  const dateRange = event.endDate && event.endDate !== event.startDate
    ? `${event.startDate} - ${event.endDate}`
    : event.startDate;
  return `${dateRange} · ${event.startTime} - ${event.endTime}`;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected error";
};

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const eventSlug = String(body?.eventSlug || "").trim().toLowerCase();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();

    if (!eventSlug) {
      return NextResponse.json({ success: false, error: "Event slug is required." }, { status: 400 });
    }
    if (!subject || !message) {
      return NextResponse.json({ success: false, error: "Subject and message are required." }, { status: 400 });
    }

    await dbConnect();
    const event = await Event.findOne({ slug: eventSlug })
      .select("title slug startDate endDate startTime endTime venue registrations")
      .lean<EventSummary>();

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
    }

    const uniqueEmails = Array.from(
      new Set((event.registrations || []).map((reg) => String(reg.email || "").trim().toLowerCase()))
    ).filter((email) => emailRegex.test(email));

    if (uniqueEmails.length === 0) {
      return NextResponse.json({ success: false, error: "No registered member emails found." }, { status: 400 });
    }

    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
    const eventWindow = formatEventWindow(event);

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background-color:#080808;font-family:Inter,system-ui,-apple-system,sans-serif;color:#ffffff;">
        <div style="max-width:640px;margin:32px auto;padding:32px;background:#0f0f0f;border:1px solid rgba(255,255,255,0.08);border-radius:24px;">
          <h1 style="margin:0 0 16px;font-size:20px;letter-spacing:-0.02em;">${escapeHtml(subject)}</h1>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.7);">${safeMessage}</p>
          <div style="padding:16px 18px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:8px;">Event Details</div>
            <div style="font-size:15px;font-weight:600;">${escapeHtml(event.title)}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px;">${escapeHtml(eventWindow)}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px;">Venue: ${escapeHtml(event.venue)}</div>
          </div>
          <p style="margin-top:24px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;">FOSS Club · GCE Erode</p>
        </div>
      </body>
      </html>
    `;

    const text = [
      message,
      "",
      "Event Details",
      event.title,
      formatEventWindow(event),
      `Venue: ${event.venue}`,
      "",
      "FOSS Club · GCE Erode",
    ].join("\n");

    const result = await sendBulkEmail({
      subject,
      text,
      html,
      bcc: uniqueEmails,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Send Event Notification Error:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
