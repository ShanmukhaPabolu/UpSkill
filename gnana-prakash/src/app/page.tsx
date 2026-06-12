import { getCustomSession } from "@/lib/auth/session";
import { DASHBOARD_ROUTES } from "@/lib/auth/rbac";
import { UserRole } from "@/types";
import PortalHomepage from "@/components/shared/PortalHomepage";

export default async function HomePage() {
  const session = await getCustomSession();
  
  let dashboardUrl = "/login";
  let isAuth = false;

  if (session?.user?.role) {
    const role = session.user.role as UserRole;
    dashboardUrl = DASHBOARD_ROUTES[role] || "/login";
    isAuth = true;
  }

  return <PortalHomepage dashboardUrl={dashboardUrl} isAuth={isAuth} />;
}
