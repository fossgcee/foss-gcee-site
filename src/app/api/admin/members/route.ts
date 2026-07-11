import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";
import { requireAdmin } from "@/lib/adminAuth";
import { escapeRegex } from "@/lib/utils";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const verified = searchParams.get("verified");
    const approvedFilter = searchParams.get("approved");

    const query: Record<string, unknown> = {};

    if (search) {
      // Escape regex metacharacters to prevent ReDoS via crafted search strings.
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { department: { $regex: safeSearch, $options: "i" } },
        { year: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (verified === "true") query.otpVerified = true;
    if (verified === "false") query.otpVerified = false;
    if (approvedFilter === "true") query.approved = true;
    if (approvedFilter === "false") query.approved = false;

    const registrations = await Registration.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: registrations.length,
      data: registrations,
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
    await dbConnect();
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "ID is required." }, { status: 400 });
    await Registration.findByIdAndDelete(id);
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
    await dbConnect();
    const { id, approved, role, name, email, phone, linkedin, year, department, otpVerified } = await request.json();

    const update: Record<string, unknown> = {};
    if (typeof approved === "boolean") update.approved = approved;
    if (typeof otpVerified === "boolean") update.otpVerified = otpVerified;
    if (typeof role === "string") update.role = role.trim();
    if (typeof name === "string") update.name = name.trim();
    if (typeof email === "string") update.email = email.trim();
    if (typeof phone === "string") update.phone = phone.trim();
    if (typeof linkedin === "string") update.linkedin = linkedin.trim();
    if (typeof year === "string") update.year = year.trim();
    if (typeof department === "string") update.department = department.trim();

    const updated = await Registration.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("Update Member Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update member." }, { status: 500 });
  }
}
