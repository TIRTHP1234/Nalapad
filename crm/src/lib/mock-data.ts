import { Enquiry, DashboardKPIs, LeadStatus, Activity, FollowUp, Task } from "./types";

export const mockCounsellors = [
  { id: "c1", name: "Priya Sharma", email: "priya@nalapad.edu", role: "ADMISSION_COUNSELLOR" as const },
  { id: "c2", name: "Rahul Verma", email: "rahul@nalapad.edu", role: "ADMISSION_COUNSELLOR" as const },
  { id: "c3", name: "Sneha Patel", email: "sneha@nalapad.edu", role: "ADMISSION_COUNSELLOR" as const },
];

export const mockEnquiries: Enquiry[] = [
  {
    id: "1", enquiryId: "ENQ-2025-0001", enquiryDate: "2025-10-01", studentName: "Aarav Mehta",
    studentGender: "MALE", fatherName: "Suresh Mehta", motherName: "Kavya Mehta",
    primaryContact: "+91 98765 43210", email: "suresh.mehta@gmail.com", whatsapp: "+91 98765 43210",
    area: "Indiranagar", city: "Bengaluru", pincode: "560038", campus: "Main Campus",
    applyingClass: "Grade 1", academicYear: "2025-26", hasSibling: false,
    leadSource: "WEBSITE", campaign: "Back to School 2025", counsellorId: "c1",
    counsellorName: "Priya Sharma", status: "FOLLOW_UP", remarks: "Parent interested, needs fee details",
    createdAt: "2025-10-01T10:00:00Z", updatedAt: "2025-10-03T11:30:00Z",
  },
  {
    id: "2", enquiryId: "ENQ-2025-0002", enquiryDate: "2025-10-02", studentName: "Diya Krishnan",
    studentGender: "FEMALE", fatherName: "Rajan Krishnan", motherName: "Lakshmi Krishnan",
    primaryContact: "+91 99887 76655", email: "rajan.k@outlook.com", whatsapp: "+91 99887 76655",
    area: "Koramangala", city: "Bengaluru", pincode: "560034", campus: "Main Campus",
    applyingClass: "Grade 3", academicYear: "2025-26", hasSibling: true, siblingName: "Karthik Krishnan", siblingClass: "Grade 7",
    leadSource: "PARENT_REFERRAL", counsellorId: "c2", counsellorName: "Rahul Verma",
    status: "WALK_IN_SCHEDULED", remarks: "Walk-in scheduled for Saturday",
    createdAt: "2025-10-02T09:00:00Z", updatedAt: "2025-10-04T14:00:00Z",
  },
  {
    id: "3", enquiryId: "ENQ-2025-0003", enquiryDate: "2025-09-28", studentName: "Riya Shah",
    studentGender: "FEMALE", fatherName: "Nikhil Shah", motherName: "Pooja Shah",
    primaryContact: "+91 90000 11223", email: "nshah@gmail.com",
    area: "HSR Layout", city: "Bengaluru", pincode: "560102", campus: "Main Campus",
    applyingClass: "Grade 6", academicYear: "2025-26", hasSibling: false,
    leadSource: "GOOGLE_ADS", campaign: "Google Search Q4", counsellorId: "c1",
    counsellorName: "Priya Sharma", status: "REGISTRATION_PAID", remarks: "Registration done, admission pending",
    createdAt: "2025-09-28T08:00:00Z", updatedAt: "2025-10-06T10:00:00Z",
  },
  {
    id: "4", enquiryId: "ENQ-2025-0004", enquiryDate: "2025-09-25", studentName: "Arjun Nair",
    studentGender: "MALE", fatherName: "Sanjay Nair", motherName: "Meena Nair",
    primaryContact: "+91 91234 56789",
    area: "JP Nagar", city: "Bengaluru", pincode: "560078", campus: "Main Campus",
    applyingClass: "Grade 9", academicYear: "2025-26", hasSibling: false,
    leadSource: "WALK_IN", counsellorId: "c3", counsellorName: "Sneha Patel",
    status: "ADMISSION_CONFIRMED", remarks: "All documents verified",
    createdAt: "2025-09-25T11:00:00Z", updatedAt: "2025-10-08T16:00:00Z",
  },
  {
    id: "5", enquiryId: "ENQ-2025-0005", enquiryDate: "2025-10-05", studentName: "Ananya Rao",
    studentGender: "FEMALE", fatherName: "Venkat Rao", motherName: "Sunita Rao",
    primaryContact: "+91 87654 32109",
    area: "Whitefield", city: "Bengaluru", pincode: "560066", campus: "Main Campus",
    applyingClass: "Grade 2", academicYear: "2025-26", hasSibling: false,
    leadSource: "META", campaign: "Facebook Diwali", counsellorId: "c2",
    counsellorName: "Rahul Verma", status: "NEW", remarks: "Just submitted inquiry form",
    createdAt: "2025-10-05T17:00:00Z", updatedAt: "2025-10-05T17:00:00Z",
  },
  {
    id: "6", enquiryId: "ENQ-2025-0006", enquiryDate: "2025-09-20", studentName: "Rohan Gupta",
    studentGender: "MALE", fatherName: "Amit Gupta", motherName: "Priya Gupta",
    primaryContact: "+91 96543 21098",
    area: "Malleshwaram", city: "Bengaluru", pincode: "560003", campus: "Main Campus",
    applyingClass: "Grade 5", academicYear: "2025-26", hasSibling: false,
    leadSource: "PHONE_CALL", counsellorId: "c1", counsellorName: "Priya Sharma",
    status: "DNP", remarks: "Chose competitor school",
    createdAt: "2025-09-20T10:00:00Z", updatedAt: "2025-09-30T09:00:00Z",
  },
  {
    id: "7", enquiryId: "ENQ-2025-0007", enquiryDate: "2025-10-06", studentName: "Ishaan Kapoor",
    studentGender: "MALE", fatherName: "Deepak Kapoor", motherName: "Ritu Kapoor",
    primaryContact: "+91 88776 65544",
    area: "Sarjapur", city: "Bengaluru", pincode: "560035", campus: "Main Campus",
    applyingClass: "Grade 4", academicYear: "2025-26", hasSibling: false,
    leadSource: "STAFF_REFERRAL", counsellorId: "c3", counsellorName: "Sneha Patel",
    status: "WALK_IN_DONE", remarks: "Walk-in done, very interested",
    createdAt: "2025-10-06T09:00:00Z", updatedAt: "2025-10-09T15:00:00Z",
  },
  {
    id: "8", enquiryId: "ENQ-2025-0008", enquiryDate: "2025-10-07", studentName: "Nisha Joshi",
    studentGender: "FEMALE", fatherName: "Manoj Joshi",
    primaryContact: "+91 93456 78901",
    area: "Banashankari", city: "Bengaluru", pincode: "560070", campus: "Main Campus",
    applyingClass: "Grade 8", academicYear: "2025-26", hasSibling: true, siblingName: "Aditya Joshi", siblingClass: "Grade 10",
    leadSource: "SCHOOL_EVENT", counsellorId: "c2", counsellorName: "Rahul Verma",
    status: "FOLLOW_UP",
    createdAt: "2025-10-07T10:00:00Z", updatedAt: "2025-10-09T11:00:00Z",
  },
];

export const mockActivities: Activity[] = [
  {
    id: "a1", enquiryId: "1", type: "PHONE_CALL", dateTime: "2025-10-01T11:00:00Z",
    userId: "c1", userName: "Priya Sharma",
    outcome: "Connected", remarks: "Parent asked about fee structure. Sent fee details on WhatsApp.",
    nextAction: "Follow up in 2 days",
  },
  {
    id: "a2", enquiryId: "1", type: "WHATSAPP", dateTime: "2025-10-03T14:00:00Z",
    userId: "c1", userName: "Priya Sharma",
    outcome: "Delivered", remarks: "Sent school brochure and fee structure PDF.",
    nextAction: "Schedule walk-in",
  },
  {
    id: "a3", enquiryId: "2", type: "PHONE_CALL", dateTime: "2025-10-02T10:00:00Z",
    userId: "c2", userName: "Rahul Verma",
    outcome: "Connected", remarks: "Parent very interested. Walk-in scheduled for Oct 12.",
    nextAction: "Confirm walk-in",
  },
];

export const mockFollowUps: FollowUp[] = [
  {
    id: "f1", enquiryId: "1", date: "2025-10-12", time: "10:00",
    type: "CALL", assignedUserId: "c1", assignedUserName: "Priya Sharma",
    reminder: true, notes: "Discuss admission timeline", completed: false,
  },
  {
    id: "f2", enquiryId: "5", date: "2025-10-10", time: "11:00",
    type: "WHATSAPP", assignedUserId: "c2", assignedUserName: "Rahul Verma",
    reminder: true, notes: "First contact", completed: false,
  },
  {
    id: "f3", enquiryId: "8", date: "2025-10-08", time: "14:00",
    type: "CALL", assignedUserId: "c2", assignedUserName: "Rahul Verma",
    reminder: false, notes: "Discuss documents required", completed: false,
  },
];

export const mockTasks: Task[] = [
  {
    id: "t1", enquiryId: "1", assignedUserId: "c1", assignedUserName: "Priya Sharma",
    priority: "HIGH", dueDateTime: "2025-10-10T17:00:00Z",
    description: "Send fee structure and school brochure", status: "COMPLETED",
  },
  {
    id: "t2", enquiryId: "2", assignedUserId: "c2", assignedUserName: "Rahul Verma",
    priority: "HIGH", dueDateTime: "2025-10-11T10:00:00Z",
    description: "Confirm walk-in appointment", status: "OPEN",
  },
  {
    id: "t3", enquiryId: "5", assignedUserId: "c2", assignedUserName: "Rahul Verma",
    priority: "MEDIUM", dueDateTime: "2025-10-09T12:00:00Z",
    description: "Make first contact call", status: "OPEN",
  },
];

export const mockDashboardKPIs: DashboardKPIs = {
  totalEnquiries: 8,
  newEnquiries: 2,
  followupsDue: 3,
  overdueTasks: 2,
  walkinsScheduled: 1,
  walkinsCompleted: 2,
  registrations: 2,
  confirmedAdmissions: 1,
  conversionRate: 12.5,
  registrationFeesCollected: 10000,
  admissionFeesCollected: 45000,
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
