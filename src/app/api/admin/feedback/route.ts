import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
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
    await requireAdmin();
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
