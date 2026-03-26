import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = request.cookies.get("admin_session");

    if (!session || session.value !== "authenticated") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // If already authenticated and trying to access /admin/login, redirect to /admin
  if (pathname.startsWith("/admin/login")) {
    const session = request.cookies.get("admin_session");

    if (session && session.value === "authenticated") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Config to limit middleware to admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
