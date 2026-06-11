import { UserRole } from "@/types";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  STATE_ADMIN: 80,
  DISTRICT_ADMIN: 60,
  MANDAL_ADMIN: 40,
  VENUE_ADMIN: 40,
  TEACHER: 20,
  TRAINER: 20,
  STAFF: 10,
  STUDENT: 10,
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ["*"],
  STATE_ADMIN: ["view:all","view:reports","view:analytics","view:programs","view:venues","view:participants"],
  DISTRICT_ADMIN: ["view:district","manage:venues","manage:programs","verify:attendance","review:media","generate:reports","manage:participants"],
  MANDAL_ADMIN: ["manage:venue","create:program_data","upload:photos","upload:videos","enter:attendance","update:food","manage:participants"],
  VENUE_ADMIN: ["manage:venue","create:program_data","upload:photos","upload:videos","enter:attendance","update:food","manage:participants"],
  TEACHER: ["view:own_programs","view:attendance","view:certificates"],
  TRAINER: ["view:assigned_programs","view:sessions","enter:attendance","view:feedback"],
  STAFF: ["view:assigned_programs","view:duties","enter:attendance"],
  STUDENT: ["view:own_programs","view:attendance","view:certificates"],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}

export function canAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: "/super-admin",
  STATE_ADMIN: "/state-admin",
  DISTRICT_ADMIN: "/district-admin",
  MANDAL_ADMIN: "/mandal-admin",
  VENUE_ADMIN: "/mandal-admin",
  TEACHER: "/teacher",
  TRAINER: "/trainer",
  STAFF: "/teacher",
  STUDENT: "/student",
};
