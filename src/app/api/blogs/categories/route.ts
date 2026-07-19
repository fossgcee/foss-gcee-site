import { NextRequest, NextResponse } from "next/server";
import { getBlogCategories, addBlogCategory } from "@/services/blog";

export const dynamic = "force-dynamic";

export async function GET() {
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
