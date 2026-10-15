export type LeadStatus =
  | "NEW"
  | "FOLLOW_UP"
  | "WALK_IN_SCHEDULED"
  | "WALK_IN_DONE"
  | "REGISTRATION_PENDING"
  | "REGISTRATION_PAID"
  | "ADMISSION_PENDING"
  | "ADMISSION_CONFIRMED"
  | "ADMISSION_CANCELLED"
  | "DNP";

export type ActivityType =
  | "PHONE_CALL"
  | "WHATSAPP"
  | "EMAIL"
  | "MEETING"
  | "WALK_IN"
  | "FOLLOW_UP"
  | "NOTE"
  | "DOCUMENT_COLLECTION"
  | "PAYMENT_FOLLOW_UP"
  | "ADMISSION_CONFIRMATION";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMISSION_MANAGER"
  | "ADMISSION_COUNSELLOR"
  | "PRINCIPAL";

export type PaymentMode = "CASH" | "CHEQUE" | "ONLINE" | "UPI" | "DD";

export type DocumentStatus = "PENDING" | "SUBMITTED" | "VERIFIED";

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Enquiry {
  id: string;
  enquiryId: string;
  enquiryDate: string;
  studentName: string;
  studentDOB?: string;
  studentGender?: "MALE" | "FEMALE" | "OTHER";
  currentSchool?: string;
  fatherName?: string;
  motherName?: string;
  primaryContact: string;
  secondaryContact?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  area?: string;
  city?: string;
  pincode?: string;
  campus: string;
  applyingClass: string;
  academicYear: string;
  hasSibling: boolean;
  siblingName?: string;
  siblingClass?: string;
  leadSource: LeadSource;
  campaign?: string;
  counsellorId?: string;
  counsellorName?: string;
  status: LeadStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  activities?: Activity[];
  tasks?: Task[];
  followups?: FollowUp[];
  documents?: Document[];
}

export type LeadSource =
  | "WEBSITE"
  | "GOOGLE_ADS"
  | "META"
  | "PHONE_CALL"
  | "WHATSAPP"
  | "WALK_IN"
  | "PARENT_REFERRAL"
  | "STAFF_REFERRAL"
  | "SCHOOL_EVENT"
  | "OTHER";

export interface Activity {
  id: string;
  enquiryId: string;
  type: ActivityType;
  dateTime: string;
  userId: string;
  userName: string;
  outcome: string;
  remarks?: string;
  nextAction?: string;
}

export interface Task {
  id: string;
  enquiryId: string;
  assignedUserId: string;
  assignedUserName: string;
  priority: TaskPriority;
  dueDateTime: string;
  description: string;
  status: TaskStatus;
}

export interface FollowUp {
  id: string;
  enquiryId: string;
  date: string;
  time: string;
  type: "CALL" | "WHATSAPP" | "EMAIL" | "VISIT";
  assignedUserId: string;
  assignedUserName: string;
  reminder: boolean;
  notes?: string;
  completed: boolean;
}

export interface WalkIn {
  id: string;
  enquiryId: string;
  visitDate: string;
  visitorName: string;
  studentName: string;
  applyingClass: string;
  counsellorId: string;
  counsellorName: string;
  outcome: "INTERESTED" | "NEEDS_FOLLOW_UP" | "NOT_INTERESTED" | "REGISTRATION";
  remarks?: string;
  nextAction?: string;
}

export interface Document {
  id: string;
  enquiryId: string;
  name: string;
  status: DocumentStatus;
  remarks?: string;
  fileUrl?: string;
  uploadedAt?: string;
}

export interface DashboardKPIs {
  totalEnquiries: number;
  newEnquiries: number;
  followupsDue: number;
  overdueTasks: number;
  walkinsScheduled: number;
  walkinsCompleted: number;
  registrations: number;
  confirmedAdmissions: number;
  conversionRate: number;
  registrationFeesCollected: number;
  admissionFeesCollected: number;
}
