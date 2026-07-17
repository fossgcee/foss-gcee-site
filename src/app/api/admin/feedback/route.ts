import { NextResponse } from "next/server";
import { getFeedbacks, deleteFeedback } from "@/services/feedback";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;
    
    const feedbackList = await getFeedbacks();
    return NextResponse.json({ success: true, data: feedbackList });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await deleteFeedback(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
