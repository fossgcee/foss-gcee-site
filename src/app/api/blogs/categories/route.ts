import { NextRequest, NextResponse } from "next/server";
import { getBlogCategories, addBlogCategory } from "@/services/blog";

export const dynamic = "force-dynamic";

export async function GET() {
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
