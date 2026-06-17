import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import { AuditLogger } from "@/lib/audit/AuditLogger";

/**
 * Custom logout endpoint — clears both secure and non-secure session cookies.
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    if (token) {
      await AuditLogger.log({
        userId: token.sub,
        userName: token.name || token.email || "User",
        role: (token.role as string) || "USER",
        action: "LOGOUT",
        module: "Authentication",
        description: `User ${token.name || token.email} logged out`,
        req
      });
    }
  } catch (error) {
    console.error("Logout logging failed:", error);
  }

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
