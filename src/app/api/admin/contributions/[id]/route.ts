import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contribution from "@/models/Contribution";
import Member from "@/models/Member";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const contribution = await Contribution.findById(id);
    if (!contribution) {
      return NextResponse.json({ success: false, error: "Contribution not found" }, { status: 404 });
    }
    
    const member = await Member.findById(contribution.memberId);
    if (member && member.contributionsCount > 0) {
      member.contributionsCount -= 1;
      await member.save();
    }
    
    await Contribution.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
