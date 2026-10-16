import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateEnquiryId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `ENQ-${year}-${num}`;
}

export function mapActivityFromDb(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    enquiryId: row.enquiry_id || row.enquiryId,
    type: row.type,
    dateTime: row.performed_at || row.created_at || row.dateTime,
    userId: row.performed_by || row.userId || "",
    userName: row.performer?.full_name || row.userName || "Staff",
    outcome: row.outcome || "",
    remarks: row.remarks || "",
    nextAction: row.next_action || row.nextAction,
  };
}

export function mapTaskFromDb(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    enquiryId: row.enquiry_id || row.enquiryId,
    assignedUserId: row.assigned_to || row.assignedUserId || "",
    assignedUserName: row.assignee?.full_name || row.assignedUserName || "Unassigned",
    priority: row.priority || "MEDIUM",
    dueDateTime: row.due_datetime || row.dueDateTime,
    description: row.description || "",
    status: row.status || "OPEN",
  };
}

export function mapFollowUpFromDb(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    enquiryId: row.enquiry_id || row.enquiryId,
    date: row.follow_up_date || row.date,
    time: row.follow_up_time || row.time || "10:00 AM",
    type: row.type || "CALL",
    assignedUserId: row.assigned_to || row.assignedUserId || "",
    assignedUserName: row.assignee?.full_name || row.assignedUserName || "Staff",
    reminder: row.reminder ?? true,
    notes: row.notes || "",
    completed: row.completed ?? false,
  };
}

export function mapEnquiryFromDb(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    enquiryId: row.enquiry_id || row.enquiryId || "",
    enquiryDate: row.enquiry_date || row.enquiryDate || "",
    studentName: row.student_name || row.studentName || "",
    studentDOB: row.student_dob || row.studentDOB,
    studentGender: row.student_gender || row.studentGender,
    currentSchool: row.current_school || row.currentSchool,
    fatherName: row.father_name || row.fatherName,
    motherName: row.mother_name || row.motherName,
    primaryContact: row.primary_contact || row.primaryContact || "",
    secondaryContact: row.secondary_contact || row.secondaryContact,
    email: row.email,
    whatsapp: row.whatsapp,
    address: row.address,
    area: row.area,
    city: row.city,
    pincode: row.pincode,
    campus: row.campus || "Main Campus",
    applyingClass: row.applying_class || row.applyingClass || "",
    academicYear: row.academic_year || row.academicYear || "2025-26",
    hasSibling: row.has_sibling ?? row.hasSibling ?? false,
    siblingName: row.sibling_name || row.siblingName,
    siblingClass: row.sibling_class || row.siblingClass,
    leadSource: row.lead_source || row.leadSource || "OTHER",
    campaign: row.campaign,
    counsellorId: row.counsellor_id || row.counsellorId,
    counsellorName: row.counsellor?.full_name || row.counsellorName || "Unassigned",
    status: row.status || "NEW",
    remarks: row.remarks,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    activities: (row.activities || []).map(mapActivityFromDb),
    tasks: (row.tasks || []).map(mapTaskFromDb),
    followups: (row.follow_ups || row.followups || []).map(mapFollowUpFromDb),
    documents: row.documents || [],
  };
}
