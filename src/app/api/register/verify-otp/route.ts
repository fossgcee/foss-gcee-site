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
    const ipLimit = await rateLimit(`verify-otp:ip:${ip}`, 10, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait." },
        { status: 429, headers: { "Retry-After": Math.ceil((ipLimit.reset - Date.now()) / 1000).toString() } }
      );
    }

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP are required." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const emailLimit = await rateLimit(`verify-otp:email:${normalizedEmail}`, 8, 10 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait." },
        { status: 429, headers: { "Retry-After": Math.ceil((emailLimit.reset - Date.now()) / 1000).toString() } }
      );
    }

    const { data: session, error: sessionErr } = await supabase
      .from("otp_sessions")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (sessionErr) throw sessionErr;

    if (!session) {
      return NextResponse.json({ success: false, error: "No OTP was issued or session expired. Please restart registration." }, { status: 400 });
    }

    if (session.otp_locked_until && new Date() < new Date(session.otp_locked_until)) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((new Date(session.otp_locked_until).getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    if (new Date() > new Date(session.otp_expires_at)) {
      return NextResponse.json({ success: false, error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (session.otp !== otp.trim()) {
      const attempts = (session.otp_attempts || 0) + 1;
      let lockedUntil = session.otp_locked_until;
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }

      const { error: updateSessionErr } = await supabase
        .from("otp_sessions")
        .update({
          otp_attempts: attempts,
          otp_locked_until: lockedUntil
        })
        .eq("email", normalizedEmail);

      if (updateSessionErr) throw updateSessionErr;

      return NextResponse.json({ success: false, error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // Mark as verified & insert/update in Registration
    const { data: existingReg, error: regFetchErr } = await supabase
      .from("registrations")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (regFetchErr) throw regFetchErr;

    const payload: any = {
      email: normalizedEmail,
      name: session.name,
      linkedin: session.linkedin,
      phone: session.phone,
      year: session.year,
      department: session.department,
      otp_verified: true,
      updated_at: new Date().toISOString()
    };

    if (!existingReg) {
      payload.role = "Member";
      payload.approved = false;
    }

    const { error: upsertErr } = await supabase
      .from("registrations")
      .upsert(payload, { onConflict: "email" });

    if (upsertErr) throw upsertErr;

    // Delete the OTP session as it's no longer needed
    const { error: deleteSessionErr } = await supabase
      .from("otp_sessions")
      .delete()
      .eq("email", normalizedEmail);

    if (deleteSessionErr) throw deleteSessionErr;

    return NextResponse.json({ success: true, message: "Email verified! Registration complete." });
  } catch (error: unknown) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
