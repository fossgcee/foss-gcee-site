import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";
import OtpSession from "@/models/OtpSession";
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

    const normalizedEmail = String(email).trim().toLowerCase();

    const emailLimit = rateLimit(`verify-otp:email:${normalizedEmail}`, 8, 10 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait." },
        { status: 429, headers: { "Retry-After": Math.ceil((emailLimit.reset - Date.now()) / 1000).toString() } }
      );
    }

    const session = await OtpSession.findOne({ email: normalizedEmail });

    if (!session) {
      return NextResponse.json({ success: false, error: "No OTP was issued or session expired. Please restart registration." }, { status: 400 });
    }

    if (session.otpLockedUntil && new Date() < session.otpLockedUntil) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((session.otpLockedUntil.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    if (new Date() > session.otpExpiresAt) {
      return NextResponse.json({ success: false, error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (session.otp !== otp.trim()) {
      session.otpAttempts = (session.otpAttempts || 0) + 1;
      if (session.otpAttempts >= 5) {
        session.otpLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await session.save();
      return NextResponse.json({ success: false, error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // Mark as verified & insert/update in Registration
    await Registration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          name: session.name,
          email: session.email,
          linkedin: session.linkedin,
          phone: session.phone,
          year: session.year,
          department: session.department,
          otpVerified: true,
          otp: undefined,
          otpExpiresAt: undefined,
          otpAttempts: 0,
          otpLockedUntil: null,
        },
        $setOnInsert: {
          role: "Member",
          approved: false,
        }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    // Delete the OTP session as it's no longer needed
    await OtpSession.deleteOne({ email: normalizedEmail });

    return NextResponse.json({ success: true, message: "Email verified! Registration complete." });
  } catch (error: unknown) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
