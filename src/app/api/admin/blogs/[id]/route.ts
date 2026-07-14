import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { requireAdmin } from "@/lib/adminAuth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { title, content, excerpt, coverImage, category, author, status } = body;
    if (!title || !content || !category || !author) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const updateObj: any = {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      author,
      status,
    };

    const oldPost = await BlogPost.findById(id);
    if (!oldPost) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    if (status === "published" && oldPost.status !== "published") {
      updateObj.publishedAt = new Date();
    } else if (status === "draft") {
      updateObj.publishedAt = null;
    }

    const updated = await BlogPost.findByIdAndUpdate(id, updateObj, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await BlogPost.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
