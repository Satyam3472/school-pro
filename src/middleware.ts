import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Check if the path starts with /dashboard (protected routes)
  const isProtectedRoute = path.startsWith('/dashboard');
  const isPublicRoute = path === '/login';

  // Get session from cookies
  const sessionCookie = req.cookies.get("session")?.value;
  const session = await verifySession(sessionCookie);

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect to dashboard if accessing public route with valid session
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.).*)',
  ],
};