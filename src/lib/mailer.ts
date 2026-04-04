import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const getSiteUrl = () => {
  const raw = process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/$/, "");
};

const getLogoUrl = () => `${getSiteUrl()}/foss_gcee_logo.png`;

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends an OTP email to the user without any attachments.
 */
export async function sendOtpEmail(to: string, name: string, otp: string) {
  await transporter.sendMail({
    from: `"FOSS Club GCE Erode" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your FOSSGCEE Verification Code",
    text: `Hi ${name},\n\nYour FOSSGCEE verification code is: ${otp}\n\nThis code expires in 10 minutes. If you did not initiate this, please ignore this email.\n\nFOSS Club · GCE Erode`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body style="margin: 0; padding: 0; background-color: #080808; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #0f0f0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 48px rgba(0,0,0,0.45);">
          <div style="padding: 36px 40px 28px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
            <img src="${getLogoUrl()}" alt="FOSS Club GCE Erode" width="72" height="72" style="display:block; margin: 0 auto 16px; width:72px; height:72px; border-radius:16px;" />
            <div style="display:inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;">
              FOSS CLUB
            </div>
            <h1 style="color: #ffffff; margin: 18px 0 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">Verify your email</h1>
            <p style="color: rgba(255,255,255,0.55); margin: 12px 0 0; font-size: 14px; line-height: 1.7;">
              Hello ${name}, use the one‑time password below to complete your registration.
            </p>
          </div>
          
          <div style="padding: 42px 40px; text-align: center;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 22px 26px; display: inline-block;">
              <span style="color: #ffffff; font-family: 'Courier New', monospace; font-size: 40px; font-weight: 700; letter-spacing: 10px; margin-right: -10px;">${otp}</span>
            </div>
            <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin-top: 26px; line-height: 1.7;">
              This code expires in <strong style="color:rgba(255,255,255,0.7)">10 minutes</strong>.<br/>
              If you did not initiate this request, you can safely ignore this email.
            </p>
          </div>

          <div style="padding: 26px 40px; border-top: 1px solid rgba(255,255,255,0.05); background-color: rgba(255,255,255,0.01); text-align: center;">
            <div style="color: rgba(255,255,255,0.25); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;">
              FOSS Club · GCE Erode
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Sends a confirmation email for event registration.
 */
export async function sendEventRegistrationEmail(to: string, name: string, eventTitle: string) {
  await transporter.sendMail({
    from: `"FOSS Club GCE Erode" <${process.env.EMAIL_USER}>`,
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
export async function sendBulkEmail({ subject, text, html, bcc, batchSize = 80 }: BulkEmailOptions) {
  const fromAddress = process.env.EMAIL_USER;
  if (!fromAddress) {
    throw new Error("EMAIL_USER is not configured.");
  }
  if (!bcc.length) {
    throw new Error("No recipients provided for bulk email.");
  }

  const batches = chunkList(bcc, Math.max(1, Math.min(batchSize, 90)));
  for (const batch of batches) {
    await transporter.sendMail({
      from: `"FOSS Club GCE Erode" <${fromAddress}>`,
      to: `"FOSS Club GCE Erode" <${fromAddress}>`,
      bcc: batch,
      subject,
      text,
      html,
    });
  }

  return { batches: batches.length, recipients: bcc.length };
}
