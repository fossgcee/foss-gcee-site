import { NextRequest, NextResponse } from "next/server";
import { updateBlogCategory, deleteBlogCategory } from "@/services/blog";
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
    const { name } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { data: existing, error: fetchErr } = await supabase
      .from("blog_categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !existing) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const updated = await updateBlogCategory(id, name, slug);
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
    const { data: existing, error: fetchErr } = await supabase
      .from("blog_categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !existing) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    await deleteBlogCategory(id);
    return NextResponse.json({ success: true, data: existing });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
