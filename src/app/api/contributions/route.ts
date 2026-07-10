import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contribution from "@/models/Contribution";

// Public read-only endpoint for contributions
export async function GET() {
  try {
    await dbConnect();
    const contributions = await Contribution.find()
      .populate("memberId", "name department year")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: contributions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
