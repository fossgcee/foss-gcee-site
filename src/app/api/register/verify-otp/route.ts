import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = rateLimit(`verify-otp:ip:${ip}`, 10, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait." },
        { status: 429, headers: { "Retry-After": Math.ceil((ipLimit.reset - Date.now()) / 1000).toString() } }
      );
    }

    await dbConnect();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP are required." }, { status: 400 });
    }

    // Always fetch otp and otpExpiresAt (they are select: false in schema)
    const normalizedEmail = String(email).trim().toLowerCase();

    const emailLimit = rateLimit(`verify-otp:email:${normalizedEmail}`, 8, 10 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait." },
        { status: 429, headers: { "Retry-After": Math.ceil((emailLimit.reset - Date.now()) / 1000).toString() } }
      );
    }

    const registration = await Registration.findOne({ email: normalizedEmail }).select("+otp +otpExpiresAt");

    if (!registration) {
      return NextResponse.json({ success: false, error: "No registration found for this email." }, { status: 404 });
    }

    if (!registration.otp || !registration.otpExpiresAt) {
      return NextResponse.json({ success: false, error: "No OTP was issued. Please restart registration." }, { status: 400 });
    }

    if (registration.otpLockedUntil && new Date() < registration.otpLockedUntil) {
      return NextResponse.json({ success: false, error: "Too many attempts. Try again later." }, { status: 429 });
    }

    if (new Date() > registration.otpExpiresAt) {
      return NextResponse.json({ success: false, error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (registration.otp !== otp.trim()) {
      registration.otpAttempts = (registration.otpAttempts || 0) + 1;
      if (registration.otpAttempts >= 5) {
        registration.otpLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await registration.save();
      return NextResponse.json({ success: false, error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // Mark as verified & clear OTP
    registration.otpVerified = true;
    registration.otp = undefined;
    registration.otpExpiresAt = undefined;
    registration.otpAttempts = 0;
    registration.otpLockedUntil = null;
    await registration.save();

    return NextResponse.json({ success: true, message: "Email verified! Registration complete." });
  } catch (error: unknown) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
