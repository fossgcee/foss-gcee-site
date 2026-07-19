import { NextRequest, NextResponse } from "next/server";
import { updateBlogPost, deleteBlogPost } from "@/services/blog";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
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

    const { data: oldPost, error: fetchErr } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !oldPost) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

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

    if (status === "published" && oldPost.status !== "published") {
      updateObj.publishedAt = new Date();
    } else if (status === "draft") {
      updateObj.publishedAt = null;
    }

    const updated = await updateBlogPost(id, updateObj);
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
    const { id } = await params;
    
    const { data: oldPost, error: fetchErr } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !oldPost) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    await deleteBlogPost(id);
    return NextResponse.json({ success: true, data: oldPost });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
