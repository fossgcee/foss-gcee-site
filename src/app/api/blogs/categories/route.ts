import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogCategory from "@/models/BlogCategory";

export async function GET() {
  try {
    await dbConnect();
    let categories = await BlogCategory.find({}).sort({ name: 1 });
    if (categories.length === 0) {
      const defaultCategories = [
        { name: "Newsletters", slug: "newsletters" },
        { name: "Tips & Tricks", slug: "tips-tricks" },
        { name: "Guides", slug: "guides" },
        { name: "Updates", slug: "updates" }
      ];
      await BlogCategory.insertMany(defaultCategories);
      categories = await BlogCategory.find({}).sort({ name: 1 });
    }
    return NextResponse.json({ success: true, data: categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
