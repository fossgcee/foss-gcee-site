import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { sendBulkEmail } from "@/lib/mailer";
import { requireAdmin } from "@/lib/adminAuth";
import { emailRegex, getSiteUrl, getLogoUrl, escapeHtml, getErrorMessage } from "@/lib/utils";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    await dbConnect();
    const body = await request.json();
    const { eventId, galleryLink, customMessage } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: "eventId is required" }, { status: 400 });
    }

    const event = await Event.findById(eventId).lean<{
      title: string;
      slug: string;
      startDate: string;
      galleryLink?: string;
      registrations?: { name?: string; email?: string }[];
    }>();

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const registrations = event.registrations || [];
    const recipients = Array.from(
      new Set(
        registrations
          .map((r) => String(r.email || "").trim().toLowerCase())
          .filter((e) => emailRegex.test(e))
      )
    );

    if (recipients.length === 0) {
      return NextResponse.json({ success: false, error: "No valid attendee emails found for this event." }, { status: 400 });
    }

    const safeTitle = escapeHtml(event.title);
    const feedbackUrl = `${getSiteUrl()}/feedback?event=${event.slug}`;
    const eventUrl = `${getSiteUrl()}/events/${event.slug}`;
    const logoUrl = getLogoUrl();
    const albumLink = galleryLink || event.galleryLink || "";
    const safeMessage = customMessage ? escapeHtml(customMessage) : "";

    const subject = `Thank You for Attending: ${event.title}`;

    const text = [
      `Thank you for attending: ${event.title}`,
      "",
      safeMessage || "It was wonderful having you with us. We hope you found the event insightful and engaging.",
      "",
      albumLink ? `📸 Photo Album: ${albumLink}` : "",
      `📝 Share your feedback: ${feedbackUrl}`,
      "",
      "Your thoughts help us improve every future event.",
      "",
      "FOSS Club · GCE Erode",
    ].filter((l) => l !== null).join("\n");

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8" /></head>
        <body style="margin:0;padding:0;background-color:#080808;font-family:Inter,system-ui,-apple-system,sans-serif;color:#ffffff;">
          <div style="max-width:640px;margin:32px auto;background:#0f0f0f;border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;">
            
            <!-- Header -->
            <div style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
              <img src="${logoUrl}" alt="FOSS Club GCE Erode" width="64" height="64" style="display:block;margin:0 auto 14px;width:64px;height:64px;border-radius:14px;" />
              <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.7);font-size:10px;letter-spacing:0.3em;text-transform:uppercase;">FOSS CLUB · GCE ERODE</div>
              <h1 style="color:#ffffff;margin:18px 0 0;font-size:26px;font-weight:700;letter-spacing:-0.02em;">Thank You! 🎉</h1>
              <p style="color:rgba(255,255,255,0.55);margin:10px 0 0;font-size:14px;line-height:1.7;">${safeTitle}</p>
            </div>

            <!-- Body -->
            <div style="padding:36px 40px;">
              <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.8;margin:0 0 24px;">
                ${safeMessage || "It was wonderful having you with us. We hope you found the event insightful, inspiring, and a great experience overall!"}
              </p>

              ${albumLink ? `
              <!-- Gallery Button -->
              <div style="margin-bottom:20px;padding:18px 20px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
                <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:10px;">📸 &nbsp;Photo Album</div>
                <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 14px;">The memories from this event are now live! Relive the moments:</p>
                <a href="${escapeHtml(albumLink)}" style="display:inline-block;padding:10px 18px;border-radius:10px;background:#ffffff;color:#000000;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">View Photo Album →</a>
              </div>` : ""}

              <!-- Feedback Button -->
              <div style="padding:18px 20px;border-radius:16px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);">
                <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(165,180,252,0.6);margin-bottom:10px;">📝 &nbsp;Your Feedback Matters</div>
                <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 14px;">Help us make the next event even better. It only takes 2 minutes!</p>
                <a href="${feedbackUrl}" style="display:inline-block;padding:10px 18px;border-radius:10px;background:#6366f1;color:#ffffff;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">Submit Feedback →</a>
              </div>

              <a href="${eventUrl}" style="display:inline-block;margin-top:22px;color:rgba(255,255,255,0.35);font-size:12px;text-decoration:none;">View event page →</a>
            </div>

            <!-- Footer -->
            <div style="padding:22px 40px;background:rgba(255,255,255,0.01);border-top:1px solid rgba(255,255,255,0.05);text-align:center;color:rgba(255,255,255,0.2);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;">
              FOSS Club · Government College of Engineering, Erode
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await sendBulkEmail({ subject, text, html, bcc: recipients });

    return NextResponse.json({
      success: true,
      message: `Thank-you emails sent to ${result.recipients} attendees in ${result.batches} batch(es).`,
      recipients: result.recipients,
    });
  } catch (error) {
    console.error("Attendee mail error:", error);
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
