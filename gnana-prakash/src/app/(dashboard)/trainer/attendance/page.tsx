import { Metadata } from "next";
import TopBar from "@/components/shared/TopBar";
import AttendanceClient from "@/components/attendance/AttendanceClient";
export const metadata: Metadata = { title: "Attendance" };
export default function TrainerAttendancePage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Attendance" subtitle="Track participant attendance" />
      <div className="p-6"><AttendanceClient /></div>
    </div>
  );
}
