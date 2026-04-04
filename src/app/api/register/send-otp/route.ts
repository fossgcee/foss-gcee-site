import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";
import { generateOtp, sendOtpEmail } from "@/lib/mailer";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = rateLimit(`otp:ip:${ip}`, 5, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": Math.ceil((ipLimit.reset - Date.now()) / 1000).toString() } }
      );
    }

    await dbConnect();
    const body = await request.json();
    const { name, email, linkedin, phone, year, department } = body;

    if (!name || !email || !linkedin || !phone || !year || !department) {
      return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).replace(/\s+/g, "").trim();

    const emailLimit = rateLimit(`otp:email:${normalizedEmail}`, 3, 10 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many OTP requests. Please wait a bit." },
        { status: 429, headers: { "Retry-After": Math.ceil((emailLimit.reset - Date.now()) / 1000).toString() } }
      );
    }

    const existingByPhone = await Registration.findOne({ phone: normalizedPhone }).select("email");
    if (existingByPhone && existingByPhone.email?.toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ success: false, error: "This mobile number is already registered." }, { status: 400 });
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert: allow re-registration if not yet verified
    await Registration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          name,
          email: normalizedEmail,
          linkedin,
          phone: normalizedPhone,
          year,
          department,
          otp,
          otpExpiresAt,
          otpVerified: false,
          otpAttempts: 0,
          otpLockedUntil: null,
        },
        $setOnInsert: {
          role: "Member",
          approved: false,
        },
      },
      { upsert: true, new: true, select: "+otp +otpExpiresAt", setDefaultsOnInsert: true }
    );

    await sendOtpEmail(normalizedEmail, name, otp);

    return NextResponse.json({ success: true, message: "OTP sent to your email." });
  } catch (error: unknown) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
