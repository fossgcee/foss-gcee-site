import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";
import { generateOtp, sendOtpEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, linkedin, phone, year, department } = body;

    if (!name || !email || !linkedin || !phone || !year || !department) {
      return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert: allow re-registration if not yet verified
    await Registration.findOneAndUpdate(
      { email },
      {
        name, email, linkedin, phone, year, department,
        otp,
        otpExpiresAt,
        otpVerified: false,
      },
      { upsert: true, new: true, select: "+otp +otpExpiresAt" }
    );

    await sendOtpEmail(email, name, otp);

    return NextResponse.json({ success: true, message: "OTP sent to your email." });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
