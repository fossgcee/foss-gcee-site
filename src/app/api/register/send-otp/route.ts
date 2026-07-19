import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = await rateLimit(`otp:ip:${ip}`, 5, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": Math.ceil((ipLimit.reset - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const { name, email, linkedin, phone, year, department } = body;

    if (!name || !email || !linkedin || !phone || !year || !department) {
      return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).replace(/\s+/g, "").trim();

    const emailLimit = await rateLimit(`otp:email:${normalizedEmail}`, 3, 10 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration requests. Please wait a bit." },
        { status: 429, headers: { "Retry-After": Math.ceil((emailLimit.reset - Date.now()) / 1000).toString() } }
      );
    }

    // Check if phone or email is already registered
    const { data: existingByPhone, error: phoneErr } = await supabase
      .from("registrations")
      .select("email")
      .eq("phone", normalizedPhone)
      .eq("otp_verified", true)
      .maybeSingle();

    if (phoneErr) throw phoneErr;

    if (existingByPhone && existingByPhone.email?.toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ success: false, error: "This mobile number is already registered." }, { status: 400 });
    }

    const { data: existingByEmail, error: emailErr } = await supabase
      .from("registrations")
      .select("email")
      .eq("email", normalizedEmail)
      .eq("otp_verified", true)
      .maybeSingle();

    if (emailErr) throw emailErr;

    if (existingByEmail) {
      return NextResponse.json({ success: false, error: "This email is already registered." }, { status: 400 });
    }

    // Save directly with otpVerified: true
    const { error: upsertErr } = await supabase
      .from("registrations")
      .upsert({
        name,
        email: normalizedEmail,
        linkedin,
        phone: normalizedPhone,
        year,
        department,
        otp_verified: true,
        approved: false,
        role: "Member",
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });

    if (upsertErr) throw upsertErr;

    return NextResponse.json({ success: true, message: "Registration complete!" });
  } catch (error: unknown) {
    console.error("Direct registration error:", error);
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
