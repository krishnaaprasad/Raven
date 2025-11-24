import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // If user not logged in → redirect home
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
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
  matcher: ["/admin/:path*"],
};
