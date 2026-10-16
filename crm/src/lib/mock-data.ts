import { Enquiry, DashboardKPIs, LeadStatus, Activity, FollowUp, Task } from "./types";

export const mockCounsellors: { id: string; name: string; email: string; role: any }[] = [];

export const mockEnquiries: Enquiry[] = [];

export const mockActivities: Activity[] = [];

export const mockFollowUps: FollowUp[] = [];

export const mockTasks: Task[] = [];

export const mockDashboardKPIs: DashboardKPIs = {
  totalEnquiries: 0,
  newEnquiries: 0,
  followupsDue: 0,
  overdueTasks: 0,
  walkinsScheduled: 0,
  walkinsCompleted: 0,
  registrations: 0,
  confirmedAdmissions: 0,
  conversionRate: 0,
  registrationFeesCollected: 0,
  admissionFeesCollected: 0,
};

export const statusColors: Record<string, string> = {
  NEW: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  FOLLOW_UP: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  WALK_IN_SCHEDULED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  WALK_IN_DONE: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  REGISTRATION_PENDING: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  REGISTRATION_PAID: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  ADMISSION_PENDING: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  ADMISSION_CONFIRMED: "bg-green-500/20 text-green-300 border-green-500/30",
  ADMISSION_CANCELLED: "bg-red-500/20 text-red-300 border-red-500/30",
  DNP: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export const statusLabels: Record<string, string> = {
  NEW: "New",
  FOLLOW_UP: "Follow Up",
  WALK_IN_SCHEDULED: "Walk-in Scheduled",
  WALK_IN_DONE: "Walk-in Done",
  REGISTRATION_PENDING: "Registration Pending",
  REGISTRATION_PAID: "Registration Paid",
  ADMISSION_PENDING: "Admission Pending",
  ADMISSION_CONFIRMED: "Admission Confirmed",
  ADMISSION_CANCELLED: "Admission Cancelled",
  DNP: "Did Not Proceed",
};

export const leadSourceLabels: Record<string, string> = {
  WEBSITE: "Website / Admission Form",
  GOOGLE_ADS: "Google Ads",
  META: "Meta / Instagram / Facebook",
  PHONE_CALL: "Phone Call",
  WHATSAPP: "WhatsApp",
  WALK_IN: "Walk-in",
  PARENT_REFERRAL: "Parent Referral",
  STAFF_REFERRAL: "Staff Referral",
  SCHOOL_EVENT: "School Event / Open House",
  OTHER: "Other",
};

export const activityTypeLabels: Record<string, string> = {
  PHONE_CALL: "Phone Call",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  MEETING: "Meeting",
  WALK_IN: "Walk-in",
  FOLLOW_UP: "Follow-up",
  NOTE: "Note",
  DOCUMENT_COLLECTION: "Document Collection",
  PAYMENT_FOLLOW_UP: "Payment Follow-up",
  ADMISSION_CONFIRMATION: "Admission Confirmation",
};

export const classes = [
  "Nursery", "LKG", "UKG",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11 (Science)", "Grade 11 (Commerce)", "Grade 12 (Science)", "Grade 12 (Commerce)",
];
