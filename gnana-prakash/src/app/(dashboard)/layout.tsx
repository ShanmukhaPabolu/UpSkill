import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";

/**
 * Dashboard layout — uses direct JWT decode instead of getServerSession
 * which is broken on Next.js 16 with next-auth v4.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const tokenCookie =
    cookieStore.get("__Secure-next-auth.session-token") ||
    cookieStore.get("next-auth.session-token");

  if (!tokenCookie?.value) {
    redirect("/login");
  }

  try {
    const token = await decode({
      token: tokenCookie.value,
      secret: process.env.NEXTAUTH_SECRET!,
      salt: tokenCookie.name,
    });
    if (!token) redirect("/login");
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
