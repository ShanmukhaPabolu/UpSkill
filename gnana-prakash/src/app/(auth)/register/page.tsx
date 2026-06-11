import { Metadata } from "next";
import RegisterForm from "@/components/shared/RegisterForm";

export const metadata: Metadata = { title: "Register for Portal" };

export default function RegisterPage() {
  return <RegisterForm />;
}
