import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Use getToken directly. Explicitly tell NextAuth to check for secure cookies in production
  // or if the request is HTTPS, to bypass the Vercel Edge hostname resolution bug.
  let token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production" || req.url.startsWith("https://")
  });

  // Fallback: If token is still null, try without secureCookie just in case it's a local production build without HTTPS
  if (!token) {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: false });
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as string;

  const roleRoutes: Record<string, string[]> = {
    SUPER_ADMIN: ["/super-admin", "/state-admin", "/district-admin", "/mandal-admin"],
    STATE_ADMIN: ["/state-admin"],
    DISTRICT_ADMIN: ["/district-admin"],
    MANDAL_ADMIN: ["/mandal-admin"],
    VENUE_ADMIN: ["/mandal-admin"],
    TEACHER: ["/teacher"],
    TRAINER: ["/trainer"],
    STAFF: ["/teacher"],
    STUDENT: ["/student"],
  };

  const allowedPaths = roleRoutes[role] || [];
  const isAllowed = allowedPaths.some((p) => pathname.startsWith(p));

  if (!isAllowed && !pathname.startsWith("/api")) {
    const dashboardMap: Record<string, string> = {
      SUPER_ADMIN: "/super-admin",
      STATE_ADMIN: "/state-admin",
      DISTRICT_ADMIN: "/district-admin",
      MANDAL_ADMIN: "/mandal-admin",
      VENUE_ADMIN: "/mandal-admin",
      TEACHER: "/teacher",
      TRAINER: "/trainer",
      STAFF: "/teacher",
      STUDENT: "/student",
    };
    return NextResponse.redirect(new URL(dashboardMap[role] || "/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/state-admin/:path*",
    "/district-admin/:path*",
    "/mandal-admin/:path*",
    "/teacher/:path*",
    "/trainer/:path*",
    "/student/:path*",
  ],
};
