import { Metadata } from "next";
import TopBar from "@/components/shared/TopBar";
import DistrictsClient from "@/components/shared/DistrictsClient";
export const metadata: Metadata = { title: "Districts" };
export default function DistrictsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Districts" subtitle="Manage administrative districts" />
      <div className="p-6"><DistrictsClient /></div>
    </div>
  );
}
