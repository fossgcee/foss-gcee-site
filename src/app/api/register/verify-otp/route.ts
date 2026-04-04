import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP are required." }, { status: 400 });
    }

    // Always fetch otp and otpExpiresAt (they are select: false in schema)
    const registration = await Registration.findOne({ email }).select("+otp +otpExpiresAt");

    if (!registration) {
      return NextResponse.json({ success: false, error: "No registration found for this email." }, { status: 404 });
    }

    if (!registration.otp || !registration.otpExpiresAt) {
      return NextResponse.json({ success: false, error: "No OTP was issued. Please restart registration." }, { status: 400 });
    }

    if (new Date() > registration.otpExpiresAt) {
      return NextResponse.json({ success: false, error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (registration.otp !== otp.trim()) {
      return NextResponse.json({ success: false, error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // Mark as verified & clear OTP
    registration.otpVerified = true;
    registration.otp = undefined;
    registration.otpExpiresAt = undefined;
    await registration.save();

    return NextResponse.json({ success: true, message: "Email verified! Registration complete." });
  } catch (error: unknown) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
