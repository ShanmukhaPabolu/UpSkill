import { Metadata } from "next";
import TopBar from "@/components/shared/TopBar";
import ReportsClient from "@/components/reports/ReportsClient";
export const metadata: Metadata = { title: "Reports" };
export default function ReportsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Reports" subtitle="Generate and export reports" />
      <div className="p-6"><ReportsClient /></div>
    </div>
  );
}
