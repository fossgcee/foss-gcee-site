import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(to: string, name: string, otp: string) {
  const logoPath = path.join(process.cwd(), "public", "foss_gcee_logo.png");
  const linuxLogoPath = path.join(process.cwd(), "public", "Tux.svg");

  await transporter.sendMail({
    from: `"FOSS Club GCE Erode" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your FOSSGCEE Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body style="margin: 0; padding: 0; background-color: #080808; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
        <div style="max-width: 560px; margin: 40px auto; background-color: #0f0f0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          <div style="padding: 40px 40px 32px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
            <div style="margin-bottom: 24px;">
              <img src="cid:logo" alt="FOSS Club Logo" style="height: 48px; width: auto; margin-bottom: 16px;" />
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">Verify your email</h1>
            <p style="color: rgba(255,255,255,0.5); margin: 12px 0 0; font-size: 15px; line-height: 1.6;">Welcome back, ${name}. Use the code below to complete your verification.</p>
          </div>
          
          <div style="padding: 48px 40px; text-align: center;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; display: inline-block;">
              <span style="color: #ffffff; font-family: 'Courier New', monospace; font-size: 42px; font-weight: 700; letter-spacing: 8px; margin-right: -8px;">${otp}</span>
            </div>
            <p style="color: rgba(255,255,255,0.35); font-size: 13px; margin-top: 32px; line-height: 1.7;">⏱ This code expires in <strong style="color:rgba(255,255,255,0.6)">10 minutes</strong>.<br/>If you did not initiate this, please ignore this email.</p>
          </div>

          <div style="padding: 32px 40px; border-top: 1px solid rgba(255,255,255,0.05); background-color: rgba(255,255,255,0.01); text-align: center;">
            <div style="margin-bottom: 16px;">
               <img src="cid:linux" alt="Linux" style="height: 32px; width: auto; opacity: 0.6;" />
            </div>
            <div style="color: rgba(255,255,255,0.2); font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;">
              FOSS Club · GCE Erode &nbsp;|&nbsp; Free &amp; Open Source Software
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "logo",
      },
      {
        filename: "linux.svg",
        path: linuxLogoPath,
        cid: "linux",
      },
    ],
  });
}
