import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";

const getCookieValue = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const target = `${name}=`;
  for (const part of parts) {
    if (part.startsWith(target)) {
      return decodeURIComponent(part.slice(target.length));
    }
  }
  return null;
};

export async function requireAdmin(request: Request) {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) {
    return NextResponse.json(
      { success: false, error: "Server configuration error." },
      { status: 500 }
    );
  }

  const token = getCookieValue(request.headers.get("cookie"), "admin_session");
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access detected." },
      { status: 401 }
    );
  }

  const session = await verifySessionToken(token, sessionSecret);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access detected." },
      { status: 401 }
    );
  }

  return null;
}
