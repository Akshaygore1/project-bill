import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route starts with /admin
  if (pathname.startsWith("/admin")) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // If no session, redirect to signin
      if (!session) {
        return NextResponse.redirect(new URL("/signin", request.url));
      }

      // If user doesn't have admin role, redirect to home
      if (session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // If there's an error getting session, redirect to signin
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
