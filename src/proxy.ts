import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  const sessionToken = request.cookies.get("admin_session")?.value;
  const session = sessionToken && sessionSecret
    ? await verifySessionToken(sessionToken, sessionSecret)
    : null;
  const isAuthed = Boolean(session);

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAuthed) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Also protect admin API routes
  if (pathname.startsWith("/api/admin")) {
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access detected." },
        { status: 401 }
      );
    }
  }

  // If already authenticated and trying to access /admin/login, redirect to /admin
  if (pathname.startsWith("/admin/login")) {
    if (isAuthed) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
