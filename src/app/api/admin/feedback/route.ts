import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;
    
    await dbConnect();
    
    // Sort by newest first
    const feedbackList = await Feedback.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: feedbackList });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await Feedback.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
