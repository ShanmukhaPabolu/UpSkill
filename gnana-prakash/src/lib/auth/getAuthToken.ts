import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

/**
 * Bulletproof token extraction for Vercel production.
 * 
 * On Vercel (HTTPS), the session cookie is named `__Secure-next-auth.session-token`.
 * But `getToken` decides which cookie to read based on `NEXTAUTH_URL` — if that's
 * set to `http://localhost:3000` (a common mistake), it looks for the non-secure
 * cookie name and fails silently (returns null → 401).
 *
 * This helper tries secure first, then falls back to non-secure, covering both
 * production and local development without relying on env var correctness.
 */
export async function getAuthToken(req: NextRequest): Promise<JWT | null> {
  const secret = process.env.NEXTAUTH_SECRET;

  // Try secure cookie first (Vercel/HTTPS production)
  let token = await getToken({ req, secret, secureCookie: true });
  if (token) return token;

  // Fallback to non-secure cookie (local development / HTTP)
  token = await getToken({ req, secret, secureCookie: false });
  return token;
}
