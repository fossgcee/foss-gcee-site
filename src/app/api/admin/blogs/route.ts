import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const posts = await BlogPost.find({})
      .populate("category")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: posts });
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
    const { title, content, excerpt, coverImage, category, author, status } = body;
    if (!title || !content || !category || !author) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, content, category, author)" },
        { status: 400 }
      );
    }
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const post = await BlogPost.create({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      author,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : undefined,
    });
    return NextResponse.json({ success: true, data: post });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
