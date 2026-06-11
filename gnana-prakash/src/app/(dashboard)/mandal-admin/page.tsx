import { Metadata } from "next";
import TopBar from "@/components/shared/TopBar";
import StatCard from "@/components/dashboard/StatCard";
import { GraduationCap, Users, ClipboardList, Image } from "lucide-react";

export const metadata: Metadata = { title: "Mandal Admin Dashboard" };

export default async function MandalAdminDashboard() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Venue Dashboard" subtitle="Your training center overview" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Programs" value={3} subtitle="Currently running" icon={GraduationCap} iconColor="text-brand-600" iconBg="bg-brand-50 dark:bg-brand-950" />
          <StatCard title="Participants" value={142} subtitle="Registered today" icon={Users} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" />
          <StatCard title="Attendance" value="94%" subtitle="Today's rate" icon={ClipboardList} iconColor="text-violet-600" iconBg="bg-violet-50 dark:bg-violet-950" />
          <StatCard title="Photos Uploaded" value={28} subtitle="Pending: 5" icon={Image} iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" />
        </div>
      </div>
    </div>
  );
}
