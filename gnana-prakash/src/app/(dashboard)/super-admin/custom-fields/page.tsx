import { Metadata } from "next";
import TopBar from "@/components/shared/TopBar";
import CustomFieldsClient from "@/components/shared/CustomFieldsClient";
export const metadata: Metadata = { title: "Custom Fields" };
export default function CustomFieldsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Custom Fields" subtitle="Dynamic field configuration" />
      <div className="p-6"><CustomFieldsClient /></div>
    </div>
  );
}
