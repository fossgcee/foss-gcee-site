import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, eventName, rating, comments } = body;

    if (!eventName || !rating) {
      return NextResponse.json({ success: false, error: "Event name and rating are required." }, { status: 400 });
    }

    const newFeedback = await Feedback.create({
      name,
      email,
      eventName,
      rating,
      comments,
    });

    return NextResponse.json({ success: true, data: newFeedback }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
