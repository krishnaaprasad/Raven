import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  });
  const { pathname } = req.nextUrl;
  const isAdmin = token?.role === "ADMIN";

  // Protect admin APIs — every /api/admin/* route requires an ADMIN session
  if (pathname.startsWith("/api/admin")) {
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // If user not logged in → redirect to admin login
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // If logged in but role is NOT ADMIN
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

// Apply to all admin pages and admin APIs
export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
