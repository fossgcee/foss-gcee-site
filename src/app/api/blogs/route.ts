import { NextRequest, NextResponse } from "next/server";
import { getBlogPosts } from "@/services/blog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    const posts = await getBlogPosts({ status: "published" });

    let filteredPosts = posts;
    if (categorySlug) {
      filteredPosts = posts.filter(p => p.category && p.category.slug === categorySlug);
    }

    return NextResponse.json({ success: true, data: filteredPosts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
