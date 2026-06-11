import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { DASHBOARD_ROUTES } from "@/lib/auth/rbac";
import { UserRole } from "@/types";
import PortalHomepage from "@/components/shared/PortalHomepage";

export default async function HomePage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("next-auth.session-token") || cookieStore.get("__Secure-next-auth.session-token");
  
  let dashboardUrl = "/login";
  let isAuth = false;

  if (tokenCookie) {
    try {
      const token = await decode({ 
        token: tokenCookie.value, 
        secret: process.env.NEXTAUTH_SECRET!,
        salt: tokenCookie.name 
      });
      if (token && token.role) {
         const role = token.role as UserRole;
         dashboardUrl = DASHBOARD_ROUTES[role] || "/login";
         isAuth = true;
      }
    } catch (error) {
      console.error("JWT Decode Error:", error);
    }
  }

  return <PortalHomepage dashboardUrl={dashboardUrl} isAuth={isAuth} />;
}
