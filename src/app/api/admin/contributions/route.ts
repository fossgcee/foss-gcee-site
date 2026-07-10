import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contribution from "@/models/Contribution";
import Registration from "@/models/Registration";

export async function GET() {
  try {
    await dbConnect();
    const contributions = await Contribution.find().populate("memberId", "name department year").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: contributions, count: contributions.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { memberId, title, description, url, imageUrl, isFeatured } = body;
    
    if (!memberId || !title || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    
    const member = await Registration.findById(memberId);
    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }
    
    const contribution = await Contribution.create({
      memberId,
      title,
      description,
      url,
      imageUrl,
      isFeatured: isFeatured || false,
    });
    
    member.contributionsCount = (member.contributionsCount || 0) + 1;
    await member.save();
    
    return NextResponse.json({ success: true, data: contribution }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
