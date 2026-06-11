import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

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
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

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
