import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { sendBulkEmail } from "@/lib/mailer";
import { sendTelegramBroadcast } from "@/lib/telegram";
import { supabase } from "@/lib/supabase";
import { emailRegex, getSiteUrl, getLogoUrl, escapeHtml } from "@/lib/utils";

const buildCampaignEmail = (subject: string, messageText: string) => {
  const text = messageText;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${getLogoUrl()}" alt="FOSS GCEE Logo" style="max-width: 150px; height: auto;">
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
          <h2 style="margin-top: 0; color: #111;">${escapeHtml(subject)}</h2>
          <div style="white-space: pre-wrap; font-size: 16px; color: #444;">${escapeHtml(messageText)}</div>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
          <p>You received this email because you are registered with FOSS GCEE.</p>
          <p>&copy; ${new Date().getFullYear()} FOSS Club GCE Erode. All rights reserved.</p>
          <p><a href="${getSiteUrl()}" style="color: #666; text-decoration: none;">Visit our website</a></p>
        </div>
      </body>
    </html>
  `;
  return { subject, text, html };
};

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { target, eventSlug, customEmails, subject, message, testEmail, sendTelegram } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: "Subject and message are required." }, { status: 400 });
    }

    if (target === "event" && !eventSlug && !testEmail) {
      return NextResponse.json({ success: false, error: "Event selection is required for event campaigns." }, { status: 400 });
    }

    const emailContent = buildCampaignEmail(subject, message);
    let recipients: string[] = [];

    if (testEmail && emailRegex.test(testEmail.trim())) {
      recipients = [testEmail.trim()];
    } else {
      if (target === "all") {
        // Fetch all verified members
        const { data, error } = await supabase
          .from("registrations")
          .select("email")
          .eq("otp_verified", true);
        
        if (error) throw error;
        recipients = Array.from(new Set((data || []).map(r => r.email.trim().toLowerCase()))).filter(e => emailRegex.test(e));
      } else if (target === "event") {
        // Fetch event registrants
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("id")
          .eq("slug", eventSlug)
          .single();
          
        if (eventError || !eventData) {
          throw new Error("Event not found");
        }
        
        const { data: regsData, error: regsError } = await supabase
          .from("event_registrations")
          .select("email")
          .eq("event_id", eventData.id);
          
        if (regsError) throw regsError;
        recipients = Array.from(new Set((regsData || []).map(r => r.email.trim().toLowerCase()))).filter(e => emailRegex.test(e));
      } else if (target === "custom") {
        // Custom comma-separated list of emails
        if (typeof customEmails === "string") {
          recipients = Array.from(new Set(
            customEmails
              .split(/[\n,;]+/)
              .map(e => e.trim().toLowerCase())
              .filter(e => emailRegex.test(e))
          ));
        }
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json({ success: false, error: "No valid email recipients found for this audience." }, { status: 400 });
    }

    // Send emails using Nodemailer (BCC batching of 80)
    await sendBulkEmail({
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      bcc: recipients,
    });

    // Optionally broadcast to Telegram as well if requested
    let telegramResult = null;
    if (sendTelegram && !testEmail) {
      const telegramMsg = `📢 ${subject}\n\n${message}`;
      telegramResult = await sendTelegramBroadcast(telegramMsg).catch(err => {
        console.error("Telegram campaign broadcast error:", err);
        return null;
      });
    }

    return NextResponse.json({ 
      success: true, 
      sentCount: recipients.length,
      telegram: telegramResult 
    });
  } catch (error: any) {
    console.error("Campaign API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to send campaign" }, { status: 500 });
  }
}
