import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import BlogCategory from "@/models/BlogCategory";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    let query: any = { status: "published" };

    if (categorySlug) {
      const category = await BlogCategory.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      } else {
        return NextResponse.json({ success: true, data: [] });
      }
    }

    const posts = await BlogPost.find(query)
      .populate("category")
      .sort({ publishedAt: -1 });

    return NextResponse.json({ success: true, data: posts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
