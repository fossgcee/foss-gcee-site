import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contribution from "@/models/Contribution";
import Registration from "@/models/Registration";

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
    
    const member = await Registration.findById(contribution.memberId);
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const contribution = await Contribution.findById(id);
    if (!contribution) {
      return NextResponse.json({ success: false, error: "Contribution not found" }, { status: 404 });
    }

    // Check if memberId changed
    if (body.memberId && body.memberId !== contribution.memberId.toString()) {
      // Decrement old member
      const oldMember = await Registration.findById(contribution.memberId);
      if (oldMember && oldMember.contributionsCount > 0) {
        oldMember.contributionsCount -= 1;
        await oldMember.save();
      }
      // Increment new member
      const newMember = await Registration.findById(body.memberId);
      if (newMember) {
        newMember.contributionsCount = (newMember.contributionsCount || 0) + 1;
        await newMember.save();
      }
    }

    const updated = await Contribution.findByIdAndUpdate(
      id,
      {
        $set: {
          memberId: body.memberId || contribution.memberId,
          title: body.title !== undefined ? body.title : contribution.title,
          description: body.description !== undefined ? body.description : contribution.description,
          url: body.url !== undefined ? body.url : contribution.url,
          links: body.links !== undefined ? body.links : contribution.links,
          imageUrl: body.imageUrl !== undefined ? body.imageUrl : contribution.imageUrl,
          isFeatured: body.isFeatured !== undefined ? body.isFeatured : contribution.isFeatured,
        }
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
