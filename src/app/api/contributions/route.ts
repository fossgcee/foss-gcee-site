import { NextResponse } from "next/server";
import { getContributions } from "@/services/contribution";

export const dynamic = 'force-dynamic';

// Public read-only endpoint for contributions
export async function GET() {
  try {
    const contributions = await getContributions();

    return NextResponse.json({ success: true, data: contributions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
