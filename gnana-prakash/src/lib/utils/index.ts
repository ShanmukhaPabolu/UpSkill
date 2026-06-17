import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, fmt = "dd MMM yyyy") {
  return format(new Date(date), fmt);
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export function generateEmployeeId(): string {
  return `EMP${Date.now().toString().slice(-8)}`;
}

export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "badge-status-active",
    PENDING: "badge-status-pending",
    DRAFT: "badge-status-draft",
    REJECTED: "badge-status-rejected",
    COMPLETED: "badge-status-completed",
    APPROVED: "badge-status-active",
    CANCELLED: "badge-status-rejected",
  };
  return map[status] ?? "badge-status-draft";
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    SUPER_ADMIN: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
    STATE_ADMIN: "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300",
    DISTRICT_ADMIN: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    MANDAL_ADMIN: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    VENUE_ADMIN: "bg-amber-100 text-amber-800",
    TEACHER: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    TRAINER: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    STAFF: "bg-slate-100 text-slate-600",
  };
  return map[role] ?? "bg-slate-100 text-slate-600";
}

export function truncate(str: string, len = 50): string {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

export const PARTICIPANT_CATEGORIES = [
  { value: "SGT", label: "SGT", group: "Teachers" },
  { value: "SCHOOL_ASSISTANT", label: "School Assistant", group: "Teachers" },
  { value: "GOVERNMENT_TEACHER", label: "Government Teacher", group: "Teachers" },
  { value: "HM", label: "Head Master", group: "Teachers" },
  { value: "CRP", label: "CRP", group: "Teachers" },
  { value: "MEO", label: "MEO", group: "Teachers" },
  { value: "KRP", label: "KRP", group: "Trainers" },
  { value: "DRP", label: "DRP", group: "Trainers" },
  { value: "GUEST_FACULTY", label: "Guest Faculty", group: "Trainers" },
  { value: "SUBJECT_EXPERT", label: "Subject Expert", group: "Trainers" },
  { value: "DEO_STAFF", label: "DEO Staff", group: "Staff" },
  { value: "SS_OFFICE_STAFF", label: "SS Office Staff", group: "Staff" },
  { value: "VENUE_STAFF", label: "Venue Staff", group: "Staff" },
  { value: "SUPPORT_STAFF", label: "Support Staff", group: "Staff" },
];

export const PHOTO_CATEGORIES = [
  "Food Distribution",
  "Inauguration Programs",
  "Classes & Workshops",
  "Residential Programs",
  "Events",
  "Awareness Campaigns",
  "Training Sessions",
  "Other Activities"
];

export const VIDEO_CATEGORIES = [
  "VENUE_TOUR","INAUGURATION","SESSION","FEEDBACK","REVIEW","VALEDICTORY"
];
