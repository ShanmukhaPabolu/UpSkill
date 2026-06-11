import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { DASHBOARD_ROUTES } from "@/lib/auth/rbac";
import { UserRole } from "@/types";
import PortalHomepage from "@/components/shared/PortalHomepage";

export default async function HomePage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("next-auth.session-token") || cookieStore.get("__Secure-next-auth.session-token");
  
  if (tokenCookie) {
    const token = await decode({ token: tokenCookie.value, secret: process.env.NEXTAUTH_SECRET! });
    if (token && token.role) {
       const role = token.role as UserRole;
       redirect(DASHBOARD_ROUTES[role] || "/login");
    }
  }

  return <PortalHomepage dashboardUrl="/login" isAuth={false} />;
}
