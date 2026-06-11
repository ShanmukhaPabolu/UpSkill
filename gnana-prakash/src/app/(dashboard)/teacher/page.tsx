import { Metadata } from "next";
import { getCustomSession } from "@/lib/auth/session";
import TopBar from "@/components/shared/TopBar";
import StatCard from "@/components/dashboard/StatCard";
import { GraduationCap, ClipboardList, Award, Bell } from "lucide-react";

export const metadata: Metadata = { title: "Teacher Dashboard" };

export default async function TeacherDashboard() {
  const session = await getCustomSession();
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title={`Welcome, ${session?.user?.name?.split(" ")[0]}`} subtitle="Your training portal" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="My Trainings" value={5} subtitle="Total enrolled" icon={GraduationCap} iconColor="text-brand-600" iconBg="bg-brand-50 dark:bg-brand-950" />
          <StatCard title="Attendance" value="92%" subtitle="Average" icon={ClipboardList} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" />
          <StatCard title="Certificates" value={3} subtitle="Earned" icon={Award} iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" />
        </div>
      </div>
    </div>
  );
}
