import { supabase } from "@/lib/supabase";

export async function getMembers(filters: { search?: string; verified?: boolean; approved?: boolean }) {
  let query = supabase.from("registrations").select("*");
  
  if (filters.search) {
    const s = `%${filters.search}%`;
    query = query.or(`name.ilike.${s},email.ilike.${s},department.ilike.${s},year.ilike.${s}`);
  }
  if (filters.verified !== undefined) {
    query = query.eq("otp_verified", filters.verified);
  }
  if (filters.approved !== undefined) {
    query = query.eq("approved", filters.approved);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateMember(id: string, updates: any) {
  const mapped: any = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.email !== undefined) mapped.email = updates.email;
  if (updates.phone !== undefined) mapped.phone = updates.phone;
  if (updates.linkedin !== undefined) mapped.linkedin = updates.linkedin;
  if (updates.year !== undefined) mapped.year = updates.year;
  if (updates.department !== undefined) mapped.department = updates.department;
  if (updates.otpVerified !== undefined) mapped.otp_verified = updates.otpVerified;
  if (updates.approved !== undefined) mapped.approved = updates.approved;
  if (updates.role !== undefined) mapped.role = updates.role;

  const { data, error } = await supabase
    .from("registrations")
    .update(mapped)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMember(id: string) {
  const { error } = await supabase.from("registrations").delete().eq("id", id);
  if (error) throw error;
}
