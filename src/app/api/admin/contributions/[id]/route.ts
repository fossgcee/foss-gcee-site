import { NextRequest, NextResponse } from "next/server";
import { updateContribution, deleteContribution } from "@/services/contribution";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    const { id } = await params;
    
    const { data: contribution, error: fetchErr } = await supabase
      .from("contributions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
      
    if (fetchErr || !contribution) {
      return NextResponse.json({ success: false, error: "Contribution not found" }, { status: 404 });
    }
    
    await deleteContribution(id);
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    const { id } = await params;
    const body = await req.json();

    const { data: contribution, error: fetchErr } = await supabase
      .from("contributions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
      
    if (fetchErr || !contribution) {
      return NextResponse.json({ success: false, error: "Contribution not found" }, { status: 404 });
    }

    const updated = await updateContribution(id, body);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
