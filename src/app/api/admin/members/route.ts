import { NextResponse } from "next/server";
import { getMembers, updateMember, deleteMember } from "@/services/member";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const verified = searchParams.get("verified");
    const approvedFilter = searchParams.get("approved");

    const filters: any = {};
    if (search) filters.search = search;
    if (verified === "true") filters.verified = true;
    if (verified === "false") filters.verified = false;
    if (approvedFilter === "true") filters.approved = true;
    if (approvedFilter === "false") filters.approved = false;

    const registrations = await getMembers(filters);
    
    // Map to camelCase properties for frontend compatibility
    const mapped = registrations.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      linkedin: r.linkedin,
      phone: r.phone,
      year: r.year,
      department: r.department,
      otpVerified: r.otp_verified,
      approved: r.approved,
      role: r.role,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: mapped.length,
      data: mapped,
    });
  } catch (error: unknown) {
    console.error("Fetch Members Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch members." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "ID is required." }, { status: 400 });
    await deleteMember(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete Member Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete member." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { id, approved, role, name, email, phone, linkedin, year, department, otpVerified } = await request.json();

    const update: Record<string, any> = {};
    if (typeof approved === "boolean") update.approved = approved;
    if (typeof otpVerified === "boolean") update.otpVerified = otpVerified;
    if (typeof role === "string") update.role = role.trim();
    if (typeof name === "string") update.name = name.trim();
    if (typeof email === "string") update.email = email.trim();
    if (typeof phone === "string") update.phone = phone.trim();
    if (typeof linkedin === "string") update.linkedin = linkedin.trim();
    if (typeof year === "string") update.year = year.trim();
    if (typeof department === "string") update.department = department.trim();

    const updated = await updateMember(id, update);
    if (!updated) return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });

    const mapped = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      linkedin: updated.linkedin,
      phone: updated.phone,
      year: updated.year,
      department: updated.department,
      otpVerified: updated.otp_verified,
      approved: updated.approved,
      role: updated.role,
      createdAt: updated.created_at,
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: unknown) {
    console.error("Update Member Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update member." }, { status: 500 });
  }
}
