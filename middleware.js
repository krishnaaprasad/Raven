import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // If user not logged in → redirect to admin login
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // If logged in but role is NOT ADMIN
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

// Apply to all admin paths
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
