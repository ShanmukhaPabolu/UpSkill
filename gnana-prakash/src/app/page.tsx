import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { DASHBOARD_ROUTES } from "@/lib/auth/rbac";
import { UserRole } from "@/types";
import PortalHomepage from "@/components/shared/PortalHomepage";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  let dashboardUrl = "/login";

  if (session) {
    const role = (session.user as any).role as UserRole;
    dashboardUrl = DASHBOARD_ROUTES[role] || "/login";
  }

  return <PortalHomepage dashboardUrl={dashboardUrl} isAuth={!!session} />;
}
