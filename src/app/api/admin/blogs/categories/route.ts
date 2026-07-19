import { NextRequest, NextResponse } from "next/server";
import { getBlogCategories, addBlogCategory } from "@/services/blog";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    let categories = await getBlogCategories();
    if (categories.length === 0) {
      const defaultNames = ["Newsletters", "Tips & Tricks", "Guides", "Updates"];
      for (const name of defaultNames) {
        await addBlogCategory(name);
      }
      categories = await getBlogCategories();
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
    const body = await req.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    const category = await addBlogCategory(name);
    return NextResponse.json({ success: true, data: category });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
