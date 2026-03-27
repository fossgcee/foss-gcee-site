import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const verified = searchParams.get("verified");
    const approvedFilter = searchParams.get("approved");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { year: { $regex: search, $options: "i" } },
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { id } = await request.json();
    await Registration.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const { id, approved, role, name, email, phone, linkedin, year, department, otpVerified } = await request.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: any = {};
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
