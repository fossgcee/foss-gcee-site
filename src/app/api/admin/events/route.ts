import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { getEvents, addEvent, updateEvent, deleteEvent, getEventRegistrations } from "@/services/event";
import { sendBulkEmail } from "@/lib/mailer";
import { sendTelegramBroadcast } from "@/lib/telegram";
import { requireAdmin } from "@/lib/adminAuth";
import { emailRegex, getSiteUrl, getLogoUrl, escapeHtml, getErrorMessage } from "@/lib/utils";

type AgendaItem = { time?: string; title?: string; topic?: string; description?: string };

const normalizeAgenda = (agenda?: AgendaItem[]) =>
  (agenda || []).map((item) => ({
    time: (item.time || "").trim(),
    title: (item.title || item.topic || "").trim(),
    description: (item.description || "").trim(),
  })).filter((item) => item.time || item.title || item.description);

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
  return false;
  }
};

const isMissingRegistrationColumnsError = (error: unknown) =>
  getErrorMessage(error).includes("registration_mode") ||
  getErrorMessage(error).includes("external_rsvp_url");

const mapEvent = (item: any) => ({
  ...item,
  _id: item.id,
  academicYear: item.academic_year,
  startDate: item.start_date,
  endDate: item.end_date,
  startTime: item.start_time,
  endTime: item.end_time,
  handledBy: item.handled_by,
  speaker: item.speaker || "",
  galleryLink: item.gallery_link,
  registrationMode: item.registration_mode || "internal",
  externalRsvpUrl: item.external_rsvp_url || "",
  manualStatus: item.manual_status,
  isFeatured: item.is_featured,
  registrationsCount: item.registrations_count,
  createdAt: item.created_at,
  updatedAt: item.updated_at
});

const buildAgendaUpdateEmail = (event: {
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  agenda?: AgendaItem[];
  registrationMode?: "internal" | "external";
  externalRsvpUrl?: string;
}) => {
  const dateRange = event.endDate && event.endDate !== event.startDate
    ? `${event.startDate} - ${event.endDate}`
    : event.startDate;
  const eventUrl = `${getSiteUrl()}/events/${event.slug}`;
  const logoUrl = getLogoUrl();
  const safeTitle = escapeHtml(event.title);
  const agenda = normalizeAgenda(event.agenda);

  const rsvpUrl = event.registrationMode === "external" && event.externalRsvpUrl ? event.externalRsvpUrl : eventUrl;
  const rsvpLabel = event.registrationMode === "external" ? "RSVP on FOSS United" : "Register Now";

  const agendaLines = agenda.length
    ? agenda.map((item) => [
        item.time ? `Time: ${item.time}` : "",
        item.title ? `Title: ${item.title}` : "",
        item.description ? `Description: ${item.description}` : "",
      ].filter(Boolean).join(" | "))
    : ["Agenda details will be updated soon."];

  const agendaHtml = agenda.length
    ? agenda.map((item) => `
        <li style="margin-bottom:8px;">
          ${item.time ? `<div style="color:#ffffff;font-weight:600;">${escapeHtml(item.time)}</div>` : ""}
          <div style="color:rgba(255,255,255,0.78);font-weight:600;">${escapeHtml(item.title || "Session update")}</div>
          ${item.description ? `<div style="color:rgba(255,255,255,0.58);line-height:1.5;margin-top:2px;">${escapeHtml(item.description)}</div>` : ""}
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
    event.registrationMode === "external" && event.externalRsvpUrl ? `RSVP/Register: ${event.externalRsvpUrl}\nView event details: ${eventUrl}` : `View details: ${eventUrl}`,
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
          <div style="margin-top:20px;">
            <a href="${rsvpUrl}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#ffffff;color:#000000;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">${rsvpLabel}</a>
            ${event.registrationMode === "external" ? `<a href="${eventUrl}" style="display:inline-block;margin-left:10px;padding:12px 18px;border-radius:12px;background:rgba(255,255,255,0.08);color:#ffffff;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;border:1px solid rgba(255,255,255,0.1);">View Website</a>` : ""}
          </div>
          <p style="margin-top:22px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;">FOSS Club · GCE Erode</p>
        </div>
      </body>
    </html>
  `;

  return { subject, text, html };
};

const buildEventEmail = (event: {
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  description?: string;
  registrationMode?: "internal" | "external";
  externalRsvpUrl?: string;
}) => {
  const dateRange = event.endDate && event.endDate !== event.startDate
    ? `${event.startDate} - ${event.endDate}`
    : event.startDate;
  const eventUrl = `${getSiteUrl()}/events/${event.slug}`;
  const logoUrl = getLogoUrl();

  const safeTitle = event.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeDesc = (event.description || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const rsvpUrl = event.registrationMode === "external" && event.externalRsvpUrl ? event.externalRsvpUrl : eventUrl;
  const rsvpLabel = event.registrationMode === "external" ? "RSVP on FOSS United" : "Register Now";

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
    event.registrationMode === "external" && event.externalRsvpUrl ? `RSVP/Register: ${event.externalRsvpUrl}\nView event details: ${eventUrl}` : `Register: ${eventUrl}`,
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
          <div style="margin-top:20px;">
            <a href="${rsvpUrl}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#ffffff;color:#000000;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">${rsvpLabel}</a>
            ${event.registrationMode === "external" ? `<a href="${eventUrl}" style="display:inline-block;margin-left:10px;padding:12px 18px;border-radius:12px;background:rgba(255,255,255,0.08);color:#ffffff;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;border:1px solid rgba(255,255,255,0.1);">View Website</a>` : ""}
          </div>
          <p style="margin-top:22px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;">FOSS Club · GCE Erode</p>
        </div>
      </body>
    </html>
  `;

  return { subject, text, html };
};

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
       const { data: event, error } = await supabase
         .from("events")
         .select("*")
         .eq("id", id)
         .maybeSingle();
       if (error) throw error;
       if (!event) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
       return NextResponse.json({ success: true, data: mapEvent(event) });
    }

    const events = await getEvents();

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
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();

    const {
      title, slug, description, agenda, outcomes, academicYear,
      startDate, endDate, startTime, endTime, venue, category,
      handledBy, speaker, organizers, poster, photos, galleryLink, status, isFeatured,
      registrationMode, externalRsvpUrl,
    } = body;
    const nextRegistrationMode = registrationMode === "external" ? "external" : "internal";
    const nextExternalRsvpUrl = String(externalRsvpUrl || "").trim();

    if (nextRegistrationMode === "external" && !isHttpUrl(nextExternalRsvpUrl)) {
      return NextResponse.json({ success: false, error: "A valid external RSVP URL is required." }, { status: 400 });
    }

    const eventRaw = await addEvent({
      title, slug, description, agenda: normalizeAgenda(agenda), outcomes, academicYear,
      startDate, endDate, startTime, endTime, venue, category,
      handledBy, speaker, organizers, poster, photos, galleryLink,
      registrationMode: nextRegistrationMode,
      externalRsvpUrl: nextRegistrationMode === "external" ? nextExternalRsvpUrl : "",
      status: status ?? "upcoming",
      isFeatured: Boolean(isFeatured),
    });

    const event = mapEvent(eventRaw);

    if (event.status !== "draft") {
      try {
        const { data: members } = await supabase
          .from("registrations")
          .select("email")
          .eq("approved", true)
          .eq("otp_verified", true);
        
        const recipients = Array.from(new Set((members || []).map((m) => m.email.trim().toLowerCase()))).filter((email) => emailRegex.test(email));

        if (recipients.length > 0) {
          const emailContent = buildEventEmail(event);
          await sendBulkEmail({
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
            bcc: recipients,
          });

          // Notify telegram users
          const eventLink = `${getSiteUrl()}/events/${event.slug}`;
          const telegramMessage = event.registrationMode === "external" && event.externalRsvpUrl
            ? `🎉 New Event: ${event.title} 🎉\n\n${event.description}\n\n📍 Venue: ${event.venue}\n📅 Date: ${event.startDate} at ${event.startTime}\n\n🔗 Details: ${eventLink}\n🎟️ RSVP on FOSS United: ${event.externalRsvpUrl}`
            : `🎉 New Event: ${event.title} 🎉\n\n${event.description}\n\n📍 Venue: ${event.venue}\n📅 Date: ${event.startDate} at ${event.startTime}\n\n🔗 Register: ${eventLink}`;
          await sendTelegramBroadcast(telegramMessage).catch(console.error);
        }
      } catch (notifyError) {
        console.warn("Event created, but member notification failed:", notifyError);
      }
    }

    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath(`/`);

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error: unknown) {
    console.error("Create Event Error:", error);
    if (isMissingRegistrationColumnsError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database migration required. Apply 20260822000000_event_registration_source.sql in Supabase, then try again.",
      }, { status: 409 });
    }
    return NextResponse.json({
      success: false,
      error: getErrorMessage(error),
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

    const { data: existing, error: existingErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (existingErr || !existing) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const updatePayload: Record<string, unknown> = { ...body };
    if (Object.prototype.hasOwnProperty.call(body, "agenda")) {
      updatePayload.agenda = normalizeAgenda(body.agenda);
    }
    const nextRegistrationMode = Object.prototype.hasOwnProperty.call(body, "registrationMode")
      ? (body.registrationMode === "external" ? "external" : "internal")
      : (existing.registration_mode || "internal");
    const nextExternalRsvpUrl = Object.prototype.hasOwnProperty.call(body, "externalRsvpUrl")
      ? String(body.externalRsvpUrl || "").trim()
      : String(existing.external_rsvp_url || "").trim();

    if (nextRegistrationMode === "external" && !isHttpUrl(nextExternalRsvpUrl)) {
      return NextResponse.json({ success: false, error: "A valid external RSVP URL is required." }, { status: 400 });
    }

    if (Object.prototype.hasOwnProperty.call(body, "registrationMode")) {
      updatePayload.registrationMode = nextRegistrationMode;
      updatePayload.externalRsvpUrl = nextRegistrationMode === "external" ? nextExternalRsvpUrl : "";
    } else if (Object.prototype.hasOwnProperty.call(body, "externalRsvpUrl")) {
      updatePayload.externalRsvpUrl = nextExternalRsvpUrl;
    }

    if (Object.prototype.hasOwnProperty.call(body, "status")) {
      updatePayload.manualStatus = true;
    }

    const updatedRaw = await updateEvent(id, updatePayload);
    const event = mapEvent(updatedRaw);

    const agendaChanged = existing && Object.prototype.hasOwnProperty.call(body, "agenda")
      ? JSON.stringify(normalizeAgenda(existing.agenda)) !== JSON.stringify(normalizeAgenda(body.agenda))
      : false;

    if (agendaChanged) {
      const registrations = await getEventRegistrations(id);
      if (registrations.length) {
        try {
          const recipients = Array.from(
            new Set(
              registrations
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
              registrationMode: event.registrationMode,
              externalRsvpUrl: event.externalRsvpUrl,
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
    }

    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath(`/`);

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error: unknown) {
    console.error("Update Event Error:", error);
    if (isMissingRegistrationColumnsError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database migration required. Apply 20260822000000_event_registration_source.sql in Supabase, then try again.",
      }, { status: 409 });
    }
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

    await deleteEvent(id);

    revalidatePath("/events");
    revalidatePath(`/`);

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
