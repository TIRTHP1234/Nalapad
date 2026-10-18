"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { statusLabels, activityTypeLabels, leadSourceLabels } from "@/lib/mock-data";
import { formatDate, formatDateTime, mapEnquiryFromDb, mapActivityFromDb } from "@/lib/utils";
import { LeadStatus, ActivityType, Enquiry } from "@/lib/types";
import {
  Phone, MessageCircle, Mail, User, Tag, ChevronLeft,
  Plus, Clock, CheckCircle2, AlertCircle, FileText, Edit3,
  Activity, ClipboardList, X, Send, Calendar, Users, Loader2, Sparkles,
  CreditCard, Building2, Printer, RotateCw, Upload, Eye,
} from "lucide-react";
import Link from "next/link";
import CollectFeeModal from "@/components/CollectFeeModal";
import ReceiptModal, { ReceiptData } from "@/components/ReceiptModal";
import ScheduleWalkInModal from "@/components/ScheduleWalkInModal";
import ScheduleFollowUpModal from "@/components/ScheduleFollowUpModal";
import CreateTaskModal from "@/components/CreateTaskModal";
import DocumentUploadModal from "@/components/DocumentUploadModal";
import DocumentViewerModal from "@/components/DocumentViewerModal";

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  PHONE_CALL: <Phone size={14} />,
  WHATSAPP: <MessageCircle size={14} />,
  EMAIL: <Mail size={14} />,
  NOTE: <FileText size={14} />,
  FOLLOW_UP: <Clock size={14} />,
  WALK_IN: <User size={14} />,
  DOCUMENT_COLLECTION: <FileText size={14} />,
  PAYMENT_FOLLOW_UP: <AlertCircle size={14} />,
  ADMISSION_CONFIRMATION: <CheckCircle2 size={14} />,
};

const ACTIVITY_COLORS: Record<string, string> = {
  PHONE_CALL: "#1A56DB",
  WHATSAPP: "#16A34A",
  EMAIL: "#0891B2",
  NOTE: "#D97706",
  FOLLOW_UP: "#7C3AED",
  WALK_IN: "#0F766E",
  PAYMENT_FOLLOW_UP: "#1A56DB",
  ADMISSION_CONFIRMATION: "#047857",
};

const STATUS_FLOW: LeadStatus[] = [
  "NEW", "FOLLOW_UP", "WALK_IN_SCHEDULED", "WALK_IN_DONE",
  "REGISTRATION_PENDING", "REGISTRATION_PAID", "ADMISSION_PENDING", "ADMISSION_CONFIRMED",
];

const STATUS_LABELS_SHORT: Record<string, string> = {
  NEW: "New Lead",
  FOLLOW_UP: "Follow Up",
  WALK_IN_SCHEDULED: "Walk-in Sched.",
  WALK_IN_DONE: "Visit Completed",
  REGISTRATION_PENDING: "Reg. Pending",
  REGISTRATION_PAID: "Registered",
  ADMISSION_PENDING: "Admission Pending",
  ADMISSION_CONFIRMED: "Confirmed",
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>—</span>}</span>
  </div>
);

function EnquiryDetailContent() {
  const params = useParams();
  const id = params?.id as string;
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [tab, setTab] = useState<"timeline" | "documents" | "tasks" | "followups">("timeline");
  
  // Modals state
  const [showLogModal, setShowLogModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [existingReceipts, setExistingReceipts] = useState<any[]>([]);

  // Documents state & modals
  const [documents, setDocuments] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeUploadDoc, setActiveUploadDoc] = useState<{ name: string; id?: string } | null>(null);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [activeViewDoc, setActiveViewDoc] = useState<any | null>(null);

  // Log Activity fields
  const [activityType, setActType] = useState<ActivityType>("PHONE_CALL");
  const [outcome, setOutcome] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submittingAct, setSubmittingAct] = useState(false);

  async function fetchDetail() {
    if (!id) return;
    try {
      const res = await fetch(`/api/enquiries/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setEnquiry(mapEnquiryFromDb(json.data));
        }
      }
      // Also fetch any existing fee payments
      const feeRes = await fetch(`/api/fees?enquiryId=${id}`);
      if (feeRes.ok) {
        const feeJson = await feeRes.json();
        if (feeJson.data && Array.isArray(feeJson.data)) {
          setExistingReceipts(feeJson.data);
        }
      }
      // Fetch admission verification documents
      const docRes = await fetch(`/api/documents?enquiryId=${id}`);
      if (docRes.ok) {
        const docJson = await docRes.json();
        if (docJson.data && Array.isArray(docJson.data)) {
          setDocuments(docJson.data);
        }
      }
    } catch (err) {
      console.error("Failed to load enquiry detail:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDetail();
  }, [id]);

  async function handleStatusChange(newStatus: LeadStatus) {
    if (!enquiry || updatingStatus || enquiry.status === newStatus) return;
    setUpdatingStatus(true);
    setEnquiry(prev => prev ? { ...prev, status: newStatus } : null);
    try {
      await fetch(`/api/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchDetail();
    } catch (e) {
      console.error("Status update error:", e);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleLogActivity(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!enquiry || !outcome.trim() || submittingAct) return;
    setSubmittingAct(true);
    try {
      const res = await fetch(`/api/enquiries/${enquiry.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activityType,
          outcome,
          remarks,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const newAct = mapActivityFromDb(json.data);
        setEnquiry(prev => prev ? {
          ...prev,
          activities: [newAct, ...(prev.activities || [])],
        } : null);
        setShowLogModal(false);
        setOutcome("");
        setRemarks("");
      }
    } catch (err) {
      console.error("Activity save error:", err);
    } finally {
      setSubmittingAct(false);
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        fetchDetail();
      }
    } catch (e) {
      console.error("Failed to complete task:", e);
    }
  };

  const handleCompleteFollowUp = async (followUpId: string) => {
    try {
      const res = await fetch(`/api/followups/${followUpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        fetchDetail();
      }
    } catch (e) {
      console.error("Failed to complete follow-up:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]" style={{ color: "var(--text-sub)" }}>
        <Loader2 className="animate-spin mb-3" size={32} color="#1A56DB" />
        <p className="text-base font-semibold">Loading enquiry details...</p>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6" style={{ color: "var(--text-sub)" }}>
        <p className="text-lg font-bold" style={{ color: "var(--text-h)" }}>Enquiry Not Found</p>
        <p className="text-sm mt-1 mb-4">The enquiry record could not be located in the database.</p>
        <Link href="/enquiries" className="btn-primary text-xs py-2 px-4">
          <ChevronLeft size={14} /> Back to All Enquiries
        </Link>
      </div>
    );
  }

  const activities = enquiry.activities || [];
  const followups  = enquiry.followups  || [];
  const tasks      = enquiry.tasks      || [];
  const curIdx     = STATUS_FLOW.indexOf(enquiry.status as LeadStatus);
  const latestReceipt = existingReceipts.length > 0 ? existingReceipts[0] : null;

  const verifiedDocsCount = documents.filter((d) => d.status === "VERIFIED").length;
  const TABS = [
    { key: "timeline" as const,  label: `Timeline (${activities.length})`, icon: Activity },
    { key: "documents" as const, label: `Documents (${verifiedDocsCount}/${documents.length})`, icon: FileText },
    { key: "tasks"    as const,  label: `Tasks (${tasks.length})`,       icon: ClipboardList },
    { key: "followups"as const,  label: `Follow-ups (${followups.length})`, icon: Calendar },
  ];

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <Topbar title="Enquiry Profile" subtitle={`${enquiry.enquiryId} · ${enquiry.studentName}`} />

      <div className="p-7 space-y-6 fade-in max-w-[1600px] mx-auto w-full">

        {/* ── HEADER ACTION ROW ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center gap-4">
            <Link href="/enquiries" className="btn-secondary h-10 w-10 p-0 rounded-xl" title="Back to Enquiries">
              <ChevronLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-h)", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.02em" }}>
                  {enquiry.studentName}
                </h2>
                <StatusBadge status={enquiry.status} />
                {enquiry.hasSibling && (
                  <span className="chip" style={{ background: "#F5F3FF", color: "#7C3AED", borderColor: "#DDD6FE" }}>
                    Sibling Enrolled
                  </span>
                )}
              </div>
              <p className="text-xs font-500 mt-1" style={{ color: "var(--text-sub)" }}>
                ID: <span className="font-bold text-[var(--text-h)]">{enquiry.enquiryId}</span> &nbsp;·&nbsp; Applying for <span className="font-bold text-[var(--blue-700)]">{enquiry.applyingClass}</span> &nbsp;·&nbsp; AY {enquiry.academicYear}
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {latestReceipt && (
              <button
                onClick={() => {
                  setActiveReceipt({
                    receiptNumber: latestReceipt.receipt_number,
                    date: latestReceipt.payment_date,
                    feeType: latestReceipt.fee_type,
                    amount: Number(latestReceipt.amount),
                    paymentMode: latestReceipt.payment_mode,
                    transactionReference: latestReceipt.transaction_reference,
                    studentName: enquiry.studentName,
                    enquiryId: enquiry.enquiryId,
                    fatherName: enquiry.fatherName,
                    contact: enquiry.primaryContact,
                    applyingClass: enquiry.applyingClass,
                    academicYear: enquiry.academicYear,
                  });
                  setShowReceiptModal(true);
                }}
                className="btn-secondary text-xs"
                title="View Latest Fee Receipt"
              >
                <Printer size={14} className="text-emerald-600" />
                <span>Receipt #{latestReceipt.receipt_number}</span>
              </button>
            )}

            <button
              onClick={() => setShowWalkInModal(true)}
              className="btn-secondary text-xs"
            >
              <Building2 size={14} /> Walk-in
            </button>

            <button
              onClick={() => setShowFollowUpModal(true)}
              className="btn-secondary text-xs"
            >
              <Calendar size={14} /> Follow-up
            </button>

            <button
              onClick={() => setShowTaskModal(true)}
              className="btn-secondary text-xs"
            >
              <ClipboardList size={14} /> Task
            </button>

            <button
              onClick={() => setShowLogModal(true)}
              className="btn-secondary text-xs"
            >
              <Plus size={14} /> Log Interaction
            </button>

            <button
              onClick={() => setShowFeeModal(true)}
              className="btn-primary text-xs"
            >
              <CreditCard size={14} /> Collect Fee
            </button>
          </div>
        </div>

        {/* ── ADMISSION PROGRESS PIPELINE ── */}
        {!["DNP","ADMISSION_CANCELLED"].includes(enquiry.status) && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="section-label m-0">ADMISSION PROGRESSION</span>
              <span className="text-xs font-semibold text-[var(--blue-700)]">
                Stage {curIdx + 1} of {STATUS_FLOW.length}: {statusLabels[enquiry.status]}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {STATUS_FLOW.map((s, i) => {
                const done    = i < curIdx;
                const current = i === curIdx;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleStatusChange(s)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer focus:outline-none"
                    style={{
                      background: current ? "var(--blue-700)" : done ? "#F0FDF4" : "#FFFFFF",
                      borderColor: current ? "var(--blue-700)" : done ? "#BBF7D0" : "var(--border)",
                      color: current ? "#FFFFFF" : done ? "#15803D" : "var(--text-sub)",
                      boxShadow: current ? "0 2px 6px rgba(26,86,219,0.22)" : "none",
                    }}
                    title={`Click to set stage to ${statusLabels[s]}`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1"
                      style={{
                        background: current ? "rgba(255,255,255,0.25)" : done ? "#15803D" : "#EEF2F7",
                        color: current || done ? "#fff" : "var(--text-sub)",
                      }}
                    >
                      {done ? <CheckCircle2 size={12} /> : i + 1}
                    </div>
                    <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                      {STATUS_LABELS_SHORT[s]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MAIN 2-COLUMN ARRANGEMENT ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Left Column: Candidate & Contact Dossier ── */}
          <div className="space-y-5">

            {/* Student Info */}
            <div className="card p-5">
              <p className="section-label flex items-center gap-2">
                <User size={13} style={{ color: "var(--blue-700)" }} /> Student Profile
              </p>
              <InfoRow label="Student Name"   value={<span className="font-bold">{enquiry.studentName}</span>} />
              <InfoRow label="Applying Class"  value={<span className="font-bold text-[var(--blue-700)]">{enquiry.applyingClass}</span>} />
              <InfoRow label="Academic Year"   value={enquiry.academicYear} />
              <InfoRow label="Gender"          value={enquiry.studentGender} />
              <InfoRow label="Date of Birth"   value={enquiry.studentDOB ? formatDate(enquiry.studentDOB) : null} />
              <InfoRow label="Previous School" value={enquiry.currentSchool} />
            </div>

            {/* Parent Contact */}
            <div className="card p-5">
              <p className="section-label flex items-center gap-2">
                <Users size={13} style={{ color: "var(--blue-700)" }} /> Parent & Contact Details
              </p>
              <InfoRow label="Primary Mobile"  value={
                <a href={`tel:${enquiry.primaryContact}`} className="font-bold flex items-center gap-1.5 justify-end" style={{ color: "var(--blue-700)", textDecoration: "none" }}>
                  <Phone size={12} /> {enquiry.primaryContact}
                </a>
              } />
              <InfoRow label="WhatsApp"        value={
                enquiry.whatsapp ? (
                  <span className="flex items-center gap-1.5 justify-end font-semibold" style={{ color: "#16A34A" }}>
                    <MessageCircle size={12} /> {enquiry.whatsapp}
                  </span>
                ) : null
              } />
              <InfoRow label="Email Address"   value={
                enquiry.email ? (
                  <a href={`mailto:${enquiry.email}`} style={{ color: "var(--blue-700)", textDecoration: "none" }}>
                    {enquiry.email}
                  </a>
                ) : null
              } />
              <InfoRow label="Father's Name"   value={enquiry.fatherName} />
              <InfoRow label="Mother's Name"   value={enquiry.motherName} />
              <InfoRow label="Address / Area"  value={[enquiry.area, enquiry.city].filter(Boolean).join(", ")} />
            </div>

            {/* Fee & Receipts Dossier Card */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="section-label flex items-center gap-2 m-0">
                  <CreditCard size={13} style={{ color: "var(--blue-700)" }} /> Fee Receipts ({existingReceipts.length})
                </p>
                <button
                  onClick={() => setShowFeeModal(true)}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  + Add Payment
                </button>
              </div>

              {existingReceipts.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">No payments recorded</p>
                  <p className="mt-0.5 text-[11px]">Collect registration or tuition fee to generate official receipts.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {existingReceipts.map((rc, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#F8FAFD] border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer"
                      onClick={() => {
                        setActiveReceipt({
                          receiptNumber: rc.receipt_number,
                          date: rc.payment_date,
                          feeType: rc.fee_type,
                          amount: Number(rc.amount),
                          paymentMode: rc.payment_mode,
                          transactionReference: rc.transaction_reference,
                          studentName: enquiry.studentName,
                          enquiryId: enquiry.enquiryId,
                          fatherName: enquiry.fatherName,
                          contact: enquiry.primaryContact,
                          applyingClass: enquiry.applyingClass,
                          academicYear: enquiry.academicYear,
                        });
                        setShowReceiptModal(true);
                      }}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{rc.fee_type} Fee</p>
                        <p className="text-[11px] text-slate-500">Receipt #{rc.receipt_number} · {rc.payment_mode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-700">₹{Number(rc.amount).toLocaleString("en-IN")}</p>
                        <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 justify-end">
                          <Printer size={10} /> View / Print
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lead & Counsellor Assignment */}
            <div className="card p-5">
              <p className="section-label flex items-center gap-2">
                <Tag size={13} style={{ color: "var(--blue-700)" }} /> Lead Source & Staff
              </p>
              <InfoRow label="Source Channel"  value={
                <span className="chip" style={{ background: "var(--blue-50)", color: "var(--blue-700)", borderColor: "#BFDBFE" }}>
                  {leadSourceLabels[enquiry.leadSource] || enquiry.leadSource}
                </span>
              } />
              <InfoRow label="Campaign"        value={enquiry.campaign} />
              <InfoRow label="Enquiry Date"    value={formatDate(enquiry.enquiryDate)} />
              <InfoRow label="Counsellor"      value={
                enquiry.counsellorName ? (
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "var(--blue-700)" }}>
                      {enquiry.counsellorName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-semibold">{enquiry.counsellorName}</span>
                  </div>
                ) : <span style={{ color: "var(--text-muted)" }}>Unassigned</span>
              } />
              {enquiry.remarks && (
                <div className="mt-4 p-3.5 rounded-xl text-xs" style={{ background: "var(--blue-50)", color: "var(--text-body)", border: "1px solid #BFDBFE" }}>
                  <span className="font-bold text-[var(--blue-700)] block mb-1">Notes:</span>
                  {enquiry.remarks}
                </div>
              )}
            </div>

            {/* Quick Status Pill Bar */}
            <div className="card p-5">
              <p className="section-label mb-3">UPDATE STAGE QUICKLY</p>
              <div className="flex flex-col gap-2">
                {(["FOLLOW_UP", "WALK_IN_SCHEDULED", "REGISTRATION_PENDING", "ADMISSION_CONFIRMED", "DNP"] as LeadStatus[]).map(s => {
                  const isCurrent = enquiry.status === s;
                  return (
                    <button
                      key={s}
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange(s)}
                      className="w-full text-left text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                      style={{
                        background: isCurrent ? "var(--blue-50)" : "#F8FAFD",
                        color: isCurrent ? "var(--blue-700)" : "var(--text-body)",
                        border: `1px solid ${isCurrent ? "#BFDBFE" : "var(--border)"}`,
                      }}
                    >
                      <span>{statusLabels[s]}</span>
                      {isCurrent && <CheckCircle2 size={14} style={{ color: "var(--blue-700)" }} />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── Right Column: Interactive Tabs ── */}
          <div className="xl:col-span-2">
            <div className="card p-0 overflow-hidden">
              {/* Tab navigation strip */}
              <div className="flex border-b border-[var(--border)] bg-[#F8FAFD] px-2 items-center justify-between flex-wrap">
                <div className="flex">
                  {TABS.map(t => {
                    const Icon = t.icon;
                    const isActive = tab === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className="flex items-center gap-2 py-4 px-5 text-sm font-bold transition-all border-b-2 cursor-pointer focus:outline-none"
                        style={{
                          color: isActive ? "var(--blue-700)" : "var(--text-sub)",
                          borderColor: isActive ? "var(--blue-700)" : "transparent",
                          background: "transparent",
                        }}
                      >
                        <Icon size={16} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* In-tab Quick Action Button */}
                <div className="pr-4 py-2">
                  {tab === "timeline" && (
                    <button
                      onClick={() => setShowLogModal(true)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Log Interaction
                    </button>
                  )}
                  {tab === "documents" && (
                    <button
                      onClick={() => {
                        setActiveUploadDoc({ name: "General Admission Document" });
                        setShowUploadModal(true);
                      }}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Upload size={14} /> Upload Document
                    </button>
                  )}
                  {tab === "tasks" && (
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Add Task
                    </button>
                  )}
                  {tab === "followups" && (
                    <button
                      onClick={() => setShowFollowUpModal(true)}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Schedule Follow-up
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {/* 1. Timeline Tab */}
                {tab === "timeline" && (
                  activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: "var(--text-sub)" }}>
                      <Activity size={38} style={{ opacity: 0.25, marginBottom: 12 }} />
                      <p className="font-bold text-base" style={{ color: "var(--text-h)" }}>No interactions logged yet</p>
                      <p className="text-xs mt-1 mb-4">Record phone calls, WhatsApp chats, visits, or counselling notes.</p>
                      <button onClick={() => setShowLogModal(true)} className="btn-primary text-xs py-2 px-4">
                        <Plus size={14} /> Log First Interaction
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {activities.map(a => (
                        <div key={a.id} className="timeline-item">
                          <div className="timeline-dot" style={{ borderColor: ACTIVITY_COLORS[a.type] || "#1A56DB", color: ACTIVITY_COLORS[a.type] || "#1A56DB" }}>
                            {ACTIVITY_ICONS[a.type]}
                          </div>
                          <div className="ml-2.5">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-bold text-sm" style={{ color: "var(--text-h)" }}>
                                {activityTypeLabels[a.type] || a.type}
                              </span>
                              <span className="chip" style={{ background: "var(--blue-50)", color: "var(--blue-700)", borderColor: "#BFDBFE", fontSize: 11 }}>
                                {a.outcome}
                              </span>
                            </div>
                            {a.remarks && (
                              <p className="text-sm mt-1" style={{ color: "var(--text-body)" }}>{a.remarks}</p>
                            )}
                            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                              Logged by {a.userName || "Staff"} · {formatDateTime(a.dateTime)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* 2. Documents Tab */}
                {tab === "documents" && (
                  <div className="space-y-4">
                    {/* Header info bar */}
                    <div className="p-4 rounded-xl border border-[var(--border)] bg-[#F8FAFD] flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <FileText size={16} className="text-[var(--blue-700)]" />
                          Admission Document Checklist
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Upload, review, and verify student records required for official admission approval.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700">
                          {verifiedDocsCount} / {documents.length} Verified
                        </span>
                        {verifiedDocsCount === documents.length && documents.length > 0 && (
                          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 size={13} /> Complete
                          </span>
                        )}
                      </div>
                    </div>

                    {documents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: "var(--text-sub)" }}>
                        <FileText size={38} style={{ opacity: 0.25, marginBottom: 12 }} />
                        <p className="font-bold text-base" style={{ color: "var(--text-h)" }}>No documents listed</p>
                        <p className="text-xs mt-1 mb-4">Click below to upload the student candidate documents.</p>
                        <button
                          onClick={() => {
                            setActiveUploadDoc({ name: "General Admission Document" });
                            setShowUploadModal(true);
                          }}
                          className="btn-primary text-xs py-2 px-4"
                        >
                          <Upload size={14} /> Upload First Document
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {documents.map((doc: any) => {
                          const isVerified = doc.status === "VERIFIED";
                          const isSubmitted = doc.status === "SUBMITTED";
                          const isPending = doc.status === "PENDING";
                          const hasFile = Boolean(doc.file_url);

                          return (
                            <div
                              key={doc.id}
                              className="p-4 rounded-xl border border-[var(--border)] bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-4 flex-wrap"
                            >
                              <div className="flex items-start gap-3.5 flex-1 min-w-[240px]">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                  style={{
                                    background: isVerified ? "#ECFDF5" : isSubmitted ? "#EFF6FF" : "#F8FAFC",
                                    color: isVerified ? "#047857" : isSubmitted ? "#1D4ED8" : "#94A3B8",
                                  }}
                                >
                                  {isVerified ? (
                                    <CheckCircle2 size={20} />
                                  ) : isSubmitted ? (
                                    <FileText size={20} />
                                  ) : (
                                    <AlertCircle size={20} />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                                    {isVerified && (
                                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Verified & Approved
                                      </span>
                                    )}
                                    {isSubmitted && (
                                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                        Awaiting Review
                                      </span>
                                    )}
                                    {isPending && (
                                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                        Pending Upload
                                      </span>
                                    )}
                                  </div>

                                  {hasFile ? (
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                      <span>{doc.file_name || "Document attached"}</span>
                                      {doc.uploaded_at && (
                                        <span>· Uploaded {formatDate(doc.uploaded_at)}</span>
                                      )}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-slate-400 mt-1">No document uploaded yet</p>
                                  )}

                                  {doc.remarks && (
                                    <div className="mt-2 text-xs p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                                      <span className="font-bold">Staff Note:</span> {doc.remarks}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {hasFile ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveViewDoc(doc);
                                        setShowViewerModal(true);
                                      }}
                                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                                    >
                                      <Eye size={13} /> View & Verify
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveUploadDoc({ name: doc.name, id: doc.id });
                                        setShowUploadModal(true);
                                      }}
                                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                                      title="Upload updated version"
                                    >
                                      <Upload size={13} /> Replace
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveUploadDoc({ name: doc.name, id: doc.id });
                                      setShowUploadModal(true);
                                    }}
                                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                                  >
                                    <Upload size={13} /> Upload File
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Tasks Tab */}
                {tab === "tasks" && (
                  tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: "var(--text-sub)" }}>
                      <ClipboardList size={38} style={{ opacity: 0.25, marginBottom: 12 }} />
                      <p className="font-bold text-base" style={{ color: "var(--text-h)" }}>No tasks for this enquiry</p>
                      <p className="text-xs mt-1 mb-4">Assignments created for counsellors will appear here.</p>
                      <button onClick={() => setShowTaskModal(true)} className="btn-primary text-xs py-2 px-4">
                        <Plus size={14} /> Create First Task
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(t => (
                        <div key={t.id} className="flex items-start justify-between gap-3.5 p-4 rounded-xl border border-[var(--border)] bg-[#F8FAFD]">
                          <div className="flex items-start gap-3.5 flex-1">
                            <div style={{ marginTop: 2 }}>
                              {t.status === "COMPLETED" ? (
                                <CheckCircle2 size={18} style={{ color: "#047857" }} />
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full border-2" style={{ width: 18, height: 18, borderColor: t.priority === "HIGH" ? "#DC2626" : "#D97706" }} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm" style={{ color: "var(--text-h)", textDecoration: t.status === "COMPLETED" ? "line-through" : "none" }}>
                                {t.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                                <span className="chip" style={{
                                  background: t.priority === "HIGH" ? "#FEF2F2" : "#FFFBEB",
                                  color: t.priority === "HIGH" ? "#DC2626" : "#D97706",
                                  borderColor: t.priority === "HIGH" ? "#FECACA" : "#FDE68A",
                                  fontSize: 11,
                                }}>
                                  {t.priority} Priority
                                </span>
                                <span style={{ color: "var(--text-sub)" }}>
                                  <Calendar size={11} className="inline mr-1" />
                                  {formatDateTime(t.dueDateTime)}
                                </span>
                                <span style={{ color: "var(--text-muted)" }} className="inline-flex items-center gap-1">
                                  <User size={12} className="text-slate-400" /> {t.assignedUserName || "Staff"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {t.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleCompleteTask(t.id)}
                              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 text-emerald-700 hover:bg-emerald-50"
                            >
                              <CheckCircle2 size={13} /> Mark Done
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* 3. Follow-ups Tab */}
                {tab === "followups" && (
                  followups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: "var(--text-sub)" }}>
                      <Calendar size={38} style={{ opacity: 0.25, marginBottom: 12 }} />
                      <p className="font-bold text-base" style={{ color: "var(--text-h)" }}>No follow-ups scheduled</p>
                      <p className="text-xs mt-1 mb-4">Schedule date and time reminders to reconnect with the parent.</p>
                      <button onClick={() => setShowFollowUpModal(true)} className="btn-primary text-xs py-2 px-4">
                        <Plus size={14} /> Schedule Follow-up
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {followups.map(f => (
                        <div key={f.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[#F8FAFD] flex-wrap">
                          <div className="flex items-center gap-3.5 flex-1 min-w-[200px]">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: f.completed ? "#ECFDF5" : "#FFFBEB" }}>
                              {f.completed
                                ? <CheckCircle2 size={20} style={{ color: "#047857" }} />
                                : <Clock size={20} style={{ color: "#D97706" }} />}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm" style={{ color: "var(--text-h)" }}>
                                {f.type} Reminder
                                {!f.completed && <span className="chip ml-2" style={{ background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A", fontSize: 11 }}>Scheduled</span>}
                              </p>
                              <p className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "var(--text-sub)" }}>
                                <span className="inline-flex items-center gap-1"><Calendar size={12} className="text-slate-400" />{f.date} at {f.time}</span>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1"><User size={12} className="text-slate-400" />{f.assignedUserName || "Counsellor"}</span>
                              </p>
                              {f.notes && <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-body)" }}>{f.notes}</p>}
                            </div>
                          </div>

                          {!f.completed && (
                            <button
                              onClick={() => handleCompleteFollowUp(f.id)}
                              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-emerald-700 hover:bg-emerald-50"
                            >
                              <CheckCircle2 size={13} /> Mark Completed
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── MODALS ── */}

      {/* 1. Log Activity Modal */}
      {showLogModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLogModal(false)}>
          <div className="modal max-w-xl p-7 sm:p-8 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Log Candidate Interaction
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Record communication with <span className="font-semibold text-slate-800">{enquiry.studentName}</span>
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowLogModal(false)} 
                className="modal-close-btn"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="form-label">Interaction Type <span className="text-rose-500 font-normal ml-0.5">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(["PHONE_CALL","WHATSAPP","EMAIL","MEETING","WALK_IN","NOTE"] as ActivityType[]).map(t => {
                    const isSelected = activityType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActType(t)}
                        className={`pill-btn py-3 px-3 text-xs justify-center gap-2 rounded-xl ${isSelected ? "active" : ""}`}
                      >
                        <span className={isSelected ? "text-orange-600" : "text-slate-400"}>{ACTIVITY_ICONS[t]}</span>
                        <span className="truncate font-medium">{activityTypeLabels[t] || t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label">Outcome / Result <span className="text-rose-500 font-normal ml-0.5">*</span></label>
                <input
                  value={outcome}
                  onChange={e => setOutcome(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Connected — Parent visited campus, interested in Grade 1"
                />
              </div>

              <div>
                <label className="form-label">Detailed Remarks & Next Steps</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Specific notes on syllabus, transport queries, fee discussion..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button type="button" onClick={() => setShowLogModal(false)} className="btn-secondary px-5">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingAct || !outcome.trim()}
                  onClick={handleLogActivity}
                  className="btn-primary px-6"
                >
                  <Send size={15} /> {submittingAct ? "Saving..." : "Save Interaction"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Fee Collection Modal */}
      {showFeeModal && (
        <CollectFeeModal
          enquiry={{
            id: enquiry.id,
            enquiryId: enquiry.enquiryId,
            studentName: enquiry.studentName,
            applyingClass: enquiry.applyingClass,
            fatherName: enquiry.fatherName,
          }}
          onClose={() => setShowFeeModal(false)}
          onSuccess={(receipt) => {
            setShowFeeModal(false);
            setActiveReceipt(receipt);
            setShowReceiptModal(true);
            fetchDetail();
          }}
        />
      )}

      {/* 3. Official Receipt Modal */}
      {showReceiptModal && activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* 4. Schedule Walk-in Modal */}
      {showWalkInModal && (
        <ScheduleWalkInModal
          initialEnquiry={{
            id: enquiry.id,
            studentName: enquiry.studentName,
            enquiryId: enquiry.enquiryId,
            primaryContact: enquiry.primaryContact,
          }}
          onClose={() => setShowWalkInModal(false)}
          onSuccess={() => {
            setShowWalkInModal(false);
            fetchDetail();
          }}
        />
      )}

      {/* 5. Schedule Follow-up Modal */}
      {showFollowUpModal && (
        <ScheduleFollowUpModal
          initialEnquiry={{
            id: enquiry.id,
            studentName: enquiry.studentName,
            enquiryId: enquiry.enquiryId,
          }}
          onClose={() => setShowFollowUpModal(false)}
          onSuccess={() => {
            setShowFollowUpModal(false);
            fetchDetail();
          }}
        />
      )}

      {/* 6. Create Task Modal */}
      {showTaskModal && (
        <CreateTaskModal
          initialEnquiry={{
            id: enquiry.id,
            studentName: enquiry.studentName,
            enquiryId: enquiry.enquiryId,
          }}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
            fetchDetail();
          }}
        />
      )}

      {/* 7. Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal && !!activeUploadDoc}
        onClose={() => {
          setShowUploadModal(false);
          setActiveUploadDoc(null);
        }}
        enquiryId={enquiry.id}
        studentName={enquiry.studentName}
        documentName={activeUploadDoc?.name || "Admission Document"}
        documentId={activeUploadDoc?.id}
        onSuccess={() => {
          setShowUploadModal(false);
          setActiveUploadDoc(null);
          fetchDetail();
        }}
      />

      {/* 8. Document Viewer & Verification Modal */}
      <DocumentViewerModal
        isOpen={showViewerModal && !!activeViewDoc}
        onClose={() => {
          setShowViewerModal(false);
          setActiveViewDoc(null);
        }}
        document={activeViewDoc}
        studentName={enquiry.studentName}
        onStatusUpdated={() => {
          setShowViewerModal(false);
          setActiveViewDoc(null);
          fetchDetail();
        }}
      />

    </div>
  );
}

export default function EnquiryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen" style={{ color: "var(--text-sub)" }}>
          <Loader2 className="animate-spin mb-3" size={32} color="#1A56DB" />
          <p className="text-base font-600">Loading enquiry...</p>
        </div>
      }
    >
      <EnquiryDetailContent />
    </Suspense>
  );
}
