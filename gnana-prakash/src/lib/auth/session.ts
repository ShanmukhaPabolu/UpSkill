import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";

/**
 * Server-side session reader for Next.js 16 + next-auth v4.
 * 
 * Replaces `getServerSession(authOptions)` which is broken in this combination.
 * Reads the session cookie directly and decodes the JWT.
 * 
 * Returns a session-like object compatible with what getServerSession returns,
 * or null if not authenticated.
 */
export async function getCustomSession() {
  const cookieStore = await cookies();
  const secureCookie = cookieStore.get("__Secure-next-auth.session-token");
  const normalCookie = cookieStore.get("next-auth.session-token");
  const tokenCookie = secureCookie || normalCookie;

  if (!tokenCookie?.value) {
    return null;
  }

  try {
    const token = await decode({
      token: tokenCookie.value,
      secret: process.env.NEXTAUTH_SECRET!,
      salt: tokenCookie.name,
    });

    if (!token) return null;

    return {
      user: {
        id: token.sub as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as string,
        employeeId: token.employeeId as string,
        district: token.district as string | undefined,
        mandal: token.mandal as string | undefined,
        venue: token.venue as string | undefined,
        avatar: token.avatar as string | undefined,
      },
      expires: token.exp
        ? new Date(Number(token.exp) * 1000).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error("[getCustomSession] decode error:", error);
    return null;
  }
}
