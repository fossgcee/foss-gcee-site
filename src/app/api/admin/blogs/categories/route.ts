import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogCategory from "@/models/BlogCategory";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

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

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const body = await req.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await BlogCategory.create({ name, slug });
    return NextResponse.json({ success: true, data: category });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
