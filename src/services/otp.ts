import { supabase } from "@/lib/supabase";

export async function getOtpSession(email: string) {
  // Delete expired sessions first
  await supabase.from("otp_sessions").delete().lt("otp_expires_at", new Date().toISOString());

  const { data, error } = await supabase
    .from("otp_sessions")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertOtpSession(session: any) {
  const { data, error } = await supabase
    .from("otp_sessions")
    .upsert({
      name: session.name,
      email: session.email.toLowerCase().trim(),
      linkedin: session.linkedin,
      phone: session.phone,
      year: session.year,
      department: session.department,
      otp: session.otp,
      otp_expires_at: session.otpExpiresAt,
      otp_attempts: session.otpAttempts ?? 0,
      otp_locked_until: session.otpLockedUntil,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOtpSession(email: string) {
  const { error } = await supabase.from("otp_sessions").delete().eq("email", email.toLowerCase().trim());
  if (error) throw error;
}
