import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import { sendBulkEmail } from "@/lib/mailer";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const getSiteUrl = () =>
  (process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://fossgcee.in").replace(/\/$/, "");

const getLogoUrl = () => `${getSiteUrl()}/foss_gcee_logo.png`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type AgendaItem = { time?: string; topic?: string };

const normalizeAgenda = (agenda?: AgendaItem[]) =>
  (agenda || []).map((item) => ({
    time: (item.time || "").trim(),
    topic: (item.topic || "").trim(),
  })).filter((item) => item.time || item.topic);

const buildAgendaUpdateEmail = (event: {
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  agenda?: AgendaItem[];
}) => {
  const dateRange = event.endDate && event.endDate !== event.startDate
    ? `${event.startDate} - ${event.endDate}`
    : event.startDate;
  const eventUrl = `${getSiteUrl()}/events/${event.slug}`;
  const logoUrl = getLogoUrl();
  const safeTitle = escapeHtml(event.title);
  const agenda = normalizeAgenda(event.agenda);

  const agendaLines = agenda.length
    ? agenda.map((item) => `${item.time ? `${item.time} — ` : ""}${item.topic || "Session update"}`)
    : ["Agenda details will be updated soon."];

  const agendaHtml = agenda.length
    ? agenda.map((item) => `
        <li style="margin-bottom:8px;">
          <span style="color:#ffffff;font-weight:600;">${escapeHtml(item.time || "")}</span>
          ${item.time ? `<span style="color:rgba(255,255,255,0.4);"> — </span>` : ""}
          <span style="color:rgba(255,255,255,0.75);">${escapeHtml(item.topic || "Session update")}</span>
        </li>
      `).join("")
    : `<li style="margin-bottom:8px;color:rgba(255,255,255,0.7);">Agenda details will be updated soon.</li>`;

  const subject = `Agenda Updated: ${event.title}`;
  const text = [
    `Agenda Updated: ${event.title}`,
    "",
    `Date: ${dateRange}`,
    `Time: ${event.startTime} - ${event.endTime}`,
    `Venue: ${event.venue}`,
    "",
    "Agenda:",
    ...agendaLines.map((line) => `- ${line}`),
    "",
    `View details: ${eventUrl}`,
    "",
    "FOSS Club · GCE Erode",
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background-color:#080808;font-family:Inter,system-ui,-apple-system,sans-serif;color:#ffffff;">
        <div style="max-width:640px;margin:32px auto;padding:32px;background:#0f0f0f;border:1px solid rgba(255,255,255,0.08);border-radius:24px;">
          <div style="text-align:center;margin-bottom:18px;">
            <img src="${logoUrl}" alt="FOSS Club GCE Erode" width="64" height="64" style="display:block;margin:0 auto 12px;width:64px;height:64px;border-radius:14px;" />
            <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.8);font-size:10px;letter-spacing:0.3em;text-transform:uppercase;">
              FOSS CLUB
            </div>
          </div>
          <h1 style="margin:0 0 10px;font-size:20px;letter-spacing:-0.02em;text-align:center;">Agenda Updated</h1>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.7);text-align:center;">
            ${safeTitle}
          </p>
          <div style="padding:16px 18px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);margin-bottom:18px;">
            <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:8px;">Event Details</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.65);">Date: ${dateRange}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px;">Time: ${event.startTime} - ${event.endTime}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px;">Venue: ${escapeHtml(event.venue)}</div>
          </div>
          <div style="padding:16px 18px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:10px;">Updated Agenda</div>
            <ul style="padding-left:18px;margin:0;list-style:disc;">
              ${agendaHtml}
            </ul>
          </div>
          <a href="${eventUrl}" style="display:inline-block;margin-top:20px;padding:12px 18px;border-radius:12px;background:#ffffff;color:#000000;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">View Event</a>
          <p style="margin-top:22px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;">FOSS Club · GCE Erode</p>
        </div>
      </body>
    </html>
  `;

  return { subject, text, html };
};

const buildEventEmail = (event: { title: string; slug: string; startDate: string; endDate: string; startTime: string; endTime: string; venue: string; description?: string }) => {
  const dateRange = event.endDate && event.endDate !== event.startDate
    ? `${event.startDate} - ${event.endDate}`
    : event.startDate;
  const eventUrl = `${getSiteUrl()}/events/${event.slug}`;
  const logoUrl = getLogoUrl();

  const safeTitle = event.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeDesc = (event.description || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const subject = `New Event: ${event.title}`;
  const text = [
    `New Event: ${event.title}`,
    "",
    `Date: ${dateRange}`,
    `Time: ${event.startTime} - ${event.endTime}`,
    `Venue: ${event.venue}`,
    "",
    safeDesc ? `About: ${event.description}` : "",
    safeDesc ? "" : "",
    `View details: ${eventUrl}`,
    "",
    "FOSS Club · GCE Erode",
  ].filter(Boolean).join("\n");

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background-color:#080808;font-family:Inter,system-ui,-apple-system,sans-serif;color:#ffffff;">
        <div style="max-width:640px;margin:32px auto;padding:32px;background:#0f0f0f;border:1px solid rgba(255,255,255,0.08);border-radius:24px;">
          <div style="text-align:center;margin-bottom:18px;">
            <img src="${logoUrl}" alt="FOSS Club GCE Erode" width="64" height="64" style="display:block;margin:0 auto 12px;width:64px;height:64px;border-radius:14px;" />
            <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.8);font-size:10px;letter-spacing:0.3em;text-transform:uppercase;">
              FOSS CLUB
            </div>
          </div>
          <h1 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;text-align:center;">${safeTitle}</h1>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.7);">${safeDesc || "A new event has been announced by FOSS Club GCE Erode."}</p>
          <div style="padding:16px 18px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:8px;">Event Details</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.65);">Date: ${dateRange}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px;">Time: ${event.startTime} - ${event.endTime}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px;">Venue: ${event.venue}</div>
          </div>
          <a href="${eventUrl}" style="display:inline-block;margin-top:20px;padding:12px 18px;border-radius:12px;background:#ffffff;color:#000000;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">View Event</a>
          <p style="margin-top:22px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;">FOSS Club · GCE Erode</p>
        </div>
      </body>
    </html>
  `;

  return { subject, text, html };
};

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
       const event = await Event.findById(id);
       if (!event) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
       return NextResponse.json({ success: true, data: event });
    }

    // Return all events including drafts for admin
    const events = await Event.find({}).sort({ startDate: -1 });

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: unknown) {
    console.error("Fetch Admin Events Error:", error);
    return NextResponse.json({
      success: false,
      error: getErrorMessage(error),
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const event = await Event.create(body);

    // Auto-notify all approved members when a new non-draft event is created.
    if (event.status !== "draft") {
      try {
        const members = await Registration.find({ approved: true, otpVerified: true }).select("email").lean<{ email: string }[]>();
        const recipients = Array.from(new Set(members.map((m) => m.email.trim().toLowerCase()))).filter((email) => emailRegex.test(email));

        if (recipients.length > 0) {
          const emailContent = buildEventEmail(event);
          await sendBulkEmail({
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
            bcc: recipients,
          });
        }
      } catch (notifyError) {
        console.warn("Event created, but member notification failed:", notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error: unknown) {
    console.error("Create Event Error:", error);
    return NextResponse.json({
      success: false,
      error: getErrorMessage(error),
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

    const existing = await Event.findById(id)
      .select("title slug startDate endDate startTime endTime venue agenda registrations")
      .lean<{
        title: string;
        slug: string;
        startDate: string;
        endDate: string;
        startTime: string;
        endTime: string;
        venue: string;
        agenda?: AgendaItem[];
        registrations?: { email?: string }[];
      }>();

    const event = await Event.findByIdAndUpdate(id, body, { new: true });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const agendaChanged = existing && Object.prototype.hasOwnProperty.call(body, "agenda")
      ? JSON.stringify(normalizeAgenda(existing.agenda)) !== JSON.stringify(normalizeAgenda(body.agenda))
      : false;

    if (agendaChanged && existing?.registrations?.length) {
      try {
        const recipients = Array.from(
          new Set(
            existing.registrations
              .map((reg) => String(reg.email || "").trim().toLowerCase())
          )
        ).filter((email) => emailRegex.test(email));

        if (recipients.length > 0) {
          const agendaEmail = buildAgendaUpdateEmail({
            title: event.title,
            slug: event.slug,
            startDate: event.startDate,
            endDate: event.endDate,
            startTime: event.startTime,
            endTime: event.endTime,
            venue: event.venue,
            agenda: body.agenda,
          });
          await sendBulkEmail({
            subject: agendaEmail.subject,
            text: agendaEmail.text,
            html: agendaEmail.html,
            bcc: recipients,
          });
        }
      } catch (notifyError) {
        console.warn("Agenda updated, but notification failed:", notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error: unknown) {
    console.error("Update Event Error:", error);
    return NextResponse.json({
      success: false,
      error: getErrorMessage(error),
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete Event Error:", error);
    return NextResponse.json({
      success: false,
      error: getErrorMessage(error),
    }, { status: 500 });
  }
}
