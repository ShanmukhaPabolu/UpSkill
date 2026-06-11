import { NextRequest, NextResponse } from "next/server";

/**
 * Custom logout endpoint — clears both secure and non-secure session cookies.
 */
export async function POST(req: NextRequest) {
  const response = NextResponse.json({ ok: true });

  // Clear both cookie variants
  response.cookies.set("next-auth.session-token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("__Secure-next-auth.session-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  // Also clear the CSRF token cookie
  response.cookies.set("next-auth.csrf-token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("__Host-next-auth.csrf-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
