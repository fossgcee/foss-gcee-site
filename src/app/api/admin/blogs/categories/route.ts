import { NextRequest, NextResponse } from "next/server";
import { getBlogCategories, addBlogCategory } from "@/services/blog";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    let categories = await getBlogCategories();
    if (categories.length === 0) {
      const defaultCategories = [
        { name: "Newsletters", slug: "newsletters" },
        { name: "Tips & Tricks", slug: "tips-tricks" },
        { name: "Guides", slug: "guides" },
        { name: "Updates", slug: "updates" }
      ];
      for (const cat of defaultCategories) {
        await addBlogCategory(cat.name, cat.slug);
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
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await addBlogCategory(name, slug);
    return NextResponse.json({ success: true, data: category });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
