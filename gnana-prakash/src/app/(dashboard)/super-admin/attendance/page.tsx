import { Metadata } from "next";
import TopBar from "@/components/shared/TopBar";
import AttendanceClient from "@/components/attendance/AttendanceClient";
export const metadata: Metadata = { title: "Attendance" };
export default function AttendancePage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Attendance" subtitle="Daily attendance tracking" />
      <div className="p-6"><AttendanceClient /></div>
    </div>
  );
}
