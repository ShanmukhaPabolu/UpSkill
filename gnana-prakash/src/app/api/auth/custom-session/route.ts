import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

/**
 * Custom session endpoint — reads the JWT cookie and returns the session.
 * Replaces NextAuth's /api/auth/session which is broken on Next.js 16.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET!;

  const secureCookie = req.cookies.get("__Secure-next-auth.session-token");
  const normalCookie = req.cookies.get("next-auth.session-token");
  const tokenCookie = secureCookie || normalCookie;

  if (!tokenCookie?.value) {
    return NextResponse.json({ user: null });
  }

  try {
    const token = await decode({
      token: tokenCookie.value,
      secret,
      salt: tokenCookie.name,
    });

    if (!token) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: token.sub,
        name: token.name,
        email: token.email,
        role: token.role,
        employeeId: token.employeeId,
        district: token.district,
        mandal: token.mandal,
        venue: token.venue,
        avatar: token.avatar,
      },
      expires: token.exp ? new Date(Number(token.exp) * 1000).toISOString() : null,
    });
  } catch (error) {
    console.error("[custom-session] decode error:", error);
    return NextResponse.json({ user: null });
  }
}
