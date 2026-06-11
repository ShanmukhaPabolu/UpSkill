import { Metadata } from "next";
import TopBar from "@/components/shared/TopBar";
import StatCard from "@/components/dashboard/StatCard";
import { GraduationCap, Users, MapPin, BarChart3 } from "lucide-react";
import connectDB from "@/lib/db/mongoose";
import Program from "@/models/Program";
import District from "@/models/District";
import Participant from "@/models/Participant";

export const metadata: Metadata = { title: "State Admin Dashboard" };

export default async function StateAdminDashboard() {
  await connectDB();
  const [programs, districts, participants] = await Promise.all([
    Program.countDocuments(),
    District.countDocuments({ isActive: true }),
    Participant.countDocuments(),
  ]);
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="State Dashboard" subtitle="Andhra Pradesh — School Education Overview" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Programs" value={programs} subtitle="State-wide" icon={GraduationCap} iconColor="text-brand-600" iconBg="bg-brand-50 dark:bg-brand-950" />
          <StatCard title="Districts" value={districts} subtitle="Active" icon={MapPin} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" />
          <StatCard title="Total Participants" value={participants} subtitle="All programs" icon={Users} iconColor="text-violet-600" iconBg="bg-violet-50 dark:bg-violet-950" />
          <StatCard title="Completion Rate" value="78%" subtitle="Programs finished" icon={BarChart3} iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" />
        </div>
      </div>
    </div>
  );
}
