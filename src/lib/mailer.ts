import nodemailer from "nodemailer";
import { getLogoUrl } from "@/lib/utils";

const getEmailUser = () => {
  return (
    process.env.EMAIL_SERVER_USER ||
    process.env.EMAIL_USER ||
    process.env.EMAIL_FROM ||
    "fossgcee@gmail.com"
  ).trim();
};

const getCandidatePasswords = (): string[] => {
  const candidates: string[] = [];
  const p1 = process.env.EMAIL_SERVER_PASSWORD;
  const p2 = process.env.EMAIL_APP_PASSWORD;
  const hardcodedFallbacks = ["duix twpt hkjo srcw", "qlin armf czkz mqij"];

  for (const p of [p1, p2, ...hardcodedFallbacks]) {
    if (p && typeof p === "string") {
      const clean = p.trim();
      const noSpaces = clean.replace(/\s+/g, "");
      if (clean && !candidates.includes(clean)) candidates.push(clean);
      if (noSpaces && !candidates.includes(noSpaces)) candidates.push(noSpaces);
    }
  }
  return candidates;
};

const createTransportForPassword = (user: string, pass: string) => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_SERVER_PORT) || 465,
    secure: true,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 20000,
  });
};

// Default exported transporter using the best primary password
export const transporter = createTransportForPassword(
  getEmailUser(),
  getCandidatePasswords()[0] || ""
);

/**
 * Sends a confirmation email for event registration.
 */
export async function sendEventRegistrationEmail(to: string, name: string, eventTitle: string) {
  const fromAddress = getEmailUser();
  const passwords = getCandidatePasswords();
  let lastError: any = null;

  for (const pass of passwords) {
    try {
      const client = createTransportForPassword(fromAddress, pass);
      await client.sendMail({
        from: `"FOSS Club GCE Erode" <${fromAddress}>`,
        to,
        subject: `Registration Confirmed: ${eventTitle}`,
        text: `Hi ${name},\n\nYour registration is confirmed for: ${eventTitle}.\nWe have received your registration. Stay tuned for further updates on WhatsApp.\n\nFOSS Club · GCE Erode`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8" /></head>
          <body style="margin: 0; padding: 0; background-color: #080808; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #0f0f0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden;">
              <div style="padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <img src="${getLogoUrl()}" alt="FOSS Club GCE Erode" width="64" height="64" style="display:block; margin: 0 auto 14px; width:64px; height:64px; border-radius:14px;" />
                <div style="display:inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;">
                  FOSS CLUB
                </div>
                <h1 style="color: #ffffff; margin: 16px 0 0; font-size: 22px;">Registration Confirmed</h1>
                <p style="color: rgba(255,255,255,0.55); margin: 10px 0 0; font-size: 14px;">Hello ${name}, you are all set for the event.</p>
              </div>
              <div style="padding: 36px 40px; text-align: center;">
                <div style="color: #ffffff; font-size: 18px; font-weight: 700; margin-bottom: 8px;">${eventTitle}</div>
                <p style="color: rgba(255,255,255,0.45); font-size: 14px;">We have received your registration. Stay tuned for further updates on WhatsApp.</p>
              </div>
              <div style="padding: 22px 40px; background: rgba(255,255,255,0.02); text-align: center; color: rgba(255,255,255,0.25); font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;">
                FOSS Club · GCE Erode
              </div>
            </div>
          </body>
          </html>
        `,
      });
      return;
    } catch (err: any) {
      console.error("sendEventRegistrationEmail attempt failed:", err.message);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("Failed to send event registration email.");
}

type BulkEmailOptions = {
  subject: string;
  text: string;
  html: string;
  bcc: string[];
  batchSize?: number;
};

const chunkList = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

/**
 * Sends a single announcement email to many recipients using BCC batching.
 */
export async function sendBulkEmail({ subject, text, html, bcc, batchSize = 60 }: BulkEmailOptions) {
  const fromAddress = getEmailUser();

  if (!bcc.length) {
    throw new Error("No recipients provided for bulk email.");
  }

  // Deduplicate and validate email addresses
  const cleanBcc = Array.from(
    new Set(bcc.map((e) => String(e || "").trim().toLowerCase()))
  ).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

  if (!cleanBcc.length) {
    throw new Error("No valid email addresses found to send to.");
  }

  const passwords = getCandidatePasswords();
  let lastError: any = null;
  let success = false;

  const batches = chunkList(cleanBcc, Math.max(1, Math.min(batchSize, 80)));

  for (const pass of passwords) {
    try {
      const client = createTransportForPassword(fromAddress, pass);
      for (const batch of batches) {
        await client.sendMail({
          from: `"FOSS Club GCE Erode" <${fromAddress}>`,
          to: `"FOSS Club GCE Erode" <${fromAddress}>`,
          bcc: batch,
          subject,
          text,
          html,
        });
      }
      success = true;
      break;
    } catch (err: any) {
      console.error(`sendBulkEmail attempt failed with password:`, err.message);
      lastError = err;
      continue;
    }
  }

  if (!success) {
    throw new Error(`Email delivery failed: ${lastError?.message || "Authentication failed"}`);
  }

  return { batches: batches.length, recipients: cleanBcc.length };
}
