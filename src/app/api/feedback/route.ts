import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";
import Event from "@/models/Event";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, year, department, eventName, rating, comments } = body;

    if (!eventName || !rating || !year || !department) {
      return NextResponse.json({ success: false, error: "Event name, rating, year and department are required." }, { status: 400 });
    }

    const newFeedback = await Feedback.create({
      name,
      email,
      year: parseInt(year),
      department,
      eventName,
      rating,
      comments,
    });

    // Auto-register logic if participant provided email and name
    if (email && name) {
      const event = await Event.findOne({ title: eventName });
      if (event) {
        const isRegistered = event.registrations?.some((r: any) => r.email === email);
        if (!isRegistered) {
          await Event.updateOne(
            { _id: event._id },
            {
              $push: {
                registrations: {
                  name,
                  department,
                  college: "Government College of Engineering, Erode",
                  year: parseInt(year),
                  mobile: "Unknown",
                  email,
                  registeredAt: new Date(),
                },
              },
              $inc: { registrationsCount: 1 },
            }
          );
        }
      }
    }

    return NextResponse.json({ success: true, data: newFeedback }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
