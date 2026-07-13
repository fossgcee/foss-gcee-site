import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contribution from "@/models/Contribution";
import "@/models/Registration";

export const dynamic = 'force-dynamic';

// Public read-only endpoint for contributions
export async function GET() {
  try {
    await dbConnect();
    const contributions = await Contribution.find()
      .populate("memberId", "name department year")
      .sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, data: contributions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
