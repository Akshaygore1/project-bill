import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";
export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes that require admin access
  const protectedRoutes = [
    "/dashboard",
    "/customers",
    "/services",
    "/invoices",
    "/parties",
    "/admin",
  ];

  // Define public routes where authenticated users should be redirected
  const publicRoutes = ["/", "/signin", "/signup"];

  // Check if the current route is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isProtectedRoute) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // If no session, redirect to signin
      if (!session) {
        return NextResponse.redirect(new URL("/signin", request.url));
      }

      // If user doesn't have admin role, redirect to orders (only allowed route for non-admins)
      if (session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/orders", request.url));
      }
    } catch (error) {
      // If there's an error getting session, redirect to signin
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // Handle authenticated users on public routes
  if (isPublicRoute) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // If user is authenticated, redirect based on role
      if (session) {
        const redirectUrl =
          session.user.role === "admin" ? "/dashboard" : "/orders";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch (error) {
      // If there's an error getting session, continue to the route
      console.error("Error checking session:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/dashboard/:path*",
    "/customers/:path*",
    "/services/:path*",
    "/invoices/:path*",
    "/parties/:path*",
    "/admin/:path*",
  ],
};
