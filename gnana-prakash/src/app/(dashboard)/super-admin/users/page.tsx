import { Metadata } from "next";
import TopBar from "@/components/shared/TopBar";
import UsersClient from "@/components/shared/UsersClient";
export const metadata: Metadata = { title: "User Management" };
export default function UsersPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="User Management" subtitle="Manage roles and access" />
      <div className="p-6"><UsersClient /></div>
    </div>
  );
}
