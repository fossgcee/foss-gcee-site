import { NextRequest, NextResponse } from "next/server";
import { getContributions, addContribution } from "@/services/contribution";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const contributions = await getContributions();
    return NextResponse.json({ success: true, data: contributions, count: contributions.length });
  } catch (error) {
    console.error("Fetch Contributions Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch contributions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    const body = await req.json();
    // Whitelist allowed fields — never pass raw body to Mongoose.
    const { memberId, title, description, url, links, imageUrl, isFeatured, order } = body;
    
    if (!memberId || !title || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    
    const { data: member, error: memberErr } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", memberId)
      .maybeSingle();
      
    if (memberErr || !member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }
    
    const contribution = await addContribution({
      memberId,
      title: String(title).trim(),
      description: String(description).trim(),
      url: url ? String(url).trim() : undefined,
      links,
      imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
      isFeatured: Boolean(isFeatured),
      order: Number(order) || 0,
    });
    
    return NextResponse.json({ success: true, data: contribution }, { status: 201 });
  } catch (error) {
    console.error("Create Contribution Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create contribution." }, { status: 500 });
  }
}
