export type UserRole = 
  | "SUPER_ADMIN" 
  | "STATE_ADMIN" 
  | "DISTRICT_ADMIN" 
  | "MANDAL_ADMIN"
  | "VENUE_ADMIN"
  | "TEACHER"
  | "TRAINER"
  | "STAFF"
  | "STUDENT";

export type ProgramStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type MediaStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY";

export type ParticipantCategory =
  | "SGT" | "SCHOOL_ASSISTANT" | "GOVERNMENT_TEACHER" | "HM" | "CRP" | "MEO"
  | "KRP" | "DRP" | "GUEST_FACULTY" | "SUBJECT_EXPERT"
  | "DEO_STAFF" | "SS_OFFICE_STAFF" | "VENUE_STAFF" | "SUPPORT_STAFF";

export interface IUser {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  district?: string;
  mandal?: string;
  venue?: string;
  designation?: string;
  department?: string;
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDistrict {
  _id: string;
  name: string;
  code: string;
  state: string;
  adminId?: string;
  isActive: boolean;
}

export interface IMandal {
  _id: string;
  name: string;
  code: string;
  district: string | IDistrict;
  isActive: boolean;
}

export interface IVenue {
  _id: string;
  name: string;
  address: string;
  district: string | IDistrict;
  mandal: string | IMandal;
  contactPerson: string;
  contactNumber: string;
  email: string;
  infrastructure: {
    classroomsCount: number;
    capacity: number;
    projectors: boolean;
    smartBoards: boolean;
    wifi: boolean;
    drinkingWater: boolean;
    diningHall: boolean;
    parking: boolean;
  };
  accommodation: {
    isResidential: boolean;
    acRooms: number;
    nonAcRooms: number;
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
  };
  photos: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface IProgram {
  _id: string;
  programName: string;
  trainingYear: string;
  department: string;
  district: string | IDistrict;
  mandal: string | IMandal;
  venue: string | IVenue;
  serviceProvider: string;
  startDate: Date;
  endDate: Date;
  status: ProgramStatus;
  description?: string;
  totalDays: number;
  expectedParticipants: number;
  createdBy: string | IUser;
  tags: string[];
  customFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParticipant {
  _id: string;
  employeeId: string;
  name: string;
  mobile: string;
  email?: string;
  schoolName?: string;
  designation: string;
  category: ParticipantCategory;
  district: string;
  mandal: string;
  program: string | IProgram;
  isResidential: boolean;
  registrationDate: Date;
  certificateIssued: boolean;
  customFields: Record<string, unknown>;
}

export interface IAttendance {
  _id: string;
  program: string | IProgram;
  date: Date;
  dayNumber: number;
  sgt: number;
  krp: number;
  drp: number;
  deoStaff: number;
  ssStaff: number;
  meo: number;
  hm: number;
  crp: number;
  others: number;
  totalAttendance: number;
  attendancePercentage: number;
  amoSignatureImage?: string;
  remarks?: string;
  recordedBy: string | IUser;
  createdAt: Date;
}

export interface IFoodRecord {
  _id: string;
  program: string | IProgram;
  date: Date;
  dayNumber: number;
  breakfast: { quantity: number; participants: number; remarks?: string; photos: string[] };
  teaBreak: { quantity: number; participants: number; remarks?: string; photos: string[] };
  lunch: { quantity: number; participants: number; remarks?: string; photos: string[] };
  snacks: { quantity: number; participants: number; remarks?: string; photos: string[] };
  dinner: { quantity: number; participants: number; remarks?: string; photos: string[] };
  recordedBy: string | IUser;
  createdAt: Date;
}

export interface IPhoto {
  _id: string;
  program: string | IProgram;
  venue?: string | IVenue;
  filename: string;
  originalName: string;
  url: string;
  category: string;
  status: MediaStatus;
  uploadedBy: string | IUser;
  uploadDate: Date;
  approvedBy?: string | IUser;
  approvalDate?: Date;
  remarks?: string;
  size: number;
  tags: string[];
}

export interface IVideo {
  _id: string;
  program: string | IProgram;
  title: string;
  description?: string;
  filename: string;
  url: string;
  category: string;
  status: MediaStatus;
  uploadedBy: string | IUser;
  uploadDate: Date;
  approvedBy?: string | IUser;
  approvalDate?: Date;
  remarks?: string;
  size: number;
  duration?: number;
}

export interface ICustomField {
  _id: string;
  name: string;
  label: string;
  fieldType: "TEXT" | "NUMBER" | "DATE" | "DROPDOWN" | "MULTI_SELECT" | "CHECKBOX" | "FILE_UPLOAD";
  module: string;
  options?: string[];
  isRequired: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ITag {
  _id: string;
  name: string;
  color: string;
  category: string;
  isActive: boolean;
  createdBy: string;
}

export interface IAuditLog {
  _id: string;
  user: string | IUser;
  role: UserRole;
  action: string;
  module: string;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalDistricts: number;
  totalMandals: number;
  totalVenues: number;
  totalPrograms: number;
  totalParticipants: number;
  totalTrainers: number;
  totalPhotos: number;
  totalVideos: number;
  activePrograms: number;
  completedPrograms: number;
  pendingMediaApprovals: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
