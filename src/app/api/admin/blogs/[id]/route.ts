import { NextRequest, NextResponse } from "next/server";
import { updateBlogPost, deleteBlogPost, NotFoundError } from "@/services/blog";
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

    const updated = await updateBlogPost(id, { title, content, excerpt, coverImage, category, author, status });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 404 });
    }
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
    const deleted = await deleteBlogPost(id);
    return NextResponse.json({ success: true, data: deleted });
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
