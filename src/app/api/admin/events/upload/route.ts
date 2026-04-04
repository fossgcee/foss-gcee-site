import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename')?.trim();
  const contentType = request.headers.get("content-type") || "";
  const contentLength = request.headers.get("content-length");
  const maxBytes = 10 * 1024 * 1024; // 10 MB

  if (!filename || !request.body) {
    return NextResponse.json({ error: "Filename and file body are required" }, { status: 400 });
  }

  if (!filename.startsWith("events/") || filename.includes("..")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 415 });
  }

  if (contentLength && Number(contentLength) > maxBytes) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
  }

  try {
    // We explicitly read the token from process.env to ensure it's loaded in Turbopack
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
       console.error("BLOB_READ_WRITE_TOKEN is missing in .env.local");
       return NextResponse.json({ error: "Server Configuration Error: Missing Blob Token" }, { status: 500 });
    }

    const blob = await put(filename, request.body, {
      access: 'public',
      addRandomSuffix: true, // Prevents "This blob already exists" error
      token: token, // Explicitly pass the token for reliability
    });

    return NextResponse.json(blob);
  } catch (error: unknown) {
    console.error("Vercel Blob Upload error Details:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
