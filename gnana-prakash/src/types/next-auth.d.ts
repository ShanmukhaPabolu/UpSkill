import { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "./index";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: UserRole;
    employeeId: string;
    district?: string;
    mandal?: string;
    venue?: string;
    avatar?: string;
  }
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      employeeId: string;
      district?: string;
      mandal?: string;
      venue?: string;
      avatar?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    employeeId: string;
    district?: string;
    mandal?: string;
    venue?: string;
    avatar?: string;
  }
}
