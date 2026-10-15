"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { mockEnquiries, mockActivities, mockFollowUps, mockTasks, statusLabels, activityTypeLabels, leadSourceLabels } from "@/lib/mock-data";
import { formatDate, formatDateTime } from "@/lib/utils";
import { LeadStatus, ActivityType } from "@/lib/types";
import {
  Phone, MessageCircle, Mail, User, MapPin, Tag, ChevronLeft,
  Plus, Clock, CheckCircle2, AlertCircle, FileText, Edit3,
  Activity, ClipboardList, X, Send, Calendar, Users,
} from "lucide-react";
import Link from "next/link";

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  PHONE_CALL: <Phone size={13} />, WHATSAPP: <MessageCircle size={13} />,
  EMAIL: <Mail size={13} />, NOTE: <FileText size={13} />,
  FOLLOW_UP: <Clock size={13} />, WALK_IN: <User size={13} />,
  DOCUMENT_COLLECTION: <FileText size={13} />, PAYMENT_FOLLOW_UP: <AlertCircle size={13} />,
};
const ACTIVITY_COLORS: Record<string, string> = {
  PHONE_CALL: "#1A56DB", WHATSAPP: "#16A34A", EMAIL: "#0891B2",
  NOTE: "#D97706", FOLLOW_UP: "#7C3AED", WALK_IN: "#0F766E",
};

const STATUS_FLOW: LeadStatus[] = [
  "NEW", "FOLLOW_UP", "WALK_IN_SCHEDULED", "WALK_IN_DONE",
  "REGISTRATION_PENDING", "REGISTRATION_PAID", "ADMISSION_PENDING", "ADMISSION_CONFIRMED",
];
const STATUS_LABELS_SHORT: Record<string, string> = {
  NEW: "New", FOLLOW_UP: "Follow Up", WALK_IN_SCHEDULED: "W-in Sched.",
  WALK_IN_DONE: "W-in Done", REGISTRATION_PENDING: "Reg. Pending",
  REGISTRATION_PAID: "Registered", ADMISSION_PENDING: "Adm. Pending",
  ADMISSION_CONFIRMED: "Confirmed",
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>—</span>}</span>
  </div>
);

export default function EnquiryDetailPage() {
  const params = useParams();
  const enquiry = mockEnquiries.find(e => e.id === params.id);
  const [tab, setTab] = useState<"timeline" | "tasks" | "followups">("timeline");
  const [showModal, setShowModal] = useState(false);
  const [activityType, setActType] = useState<ActivityType>("PHONE_CALL");
  const [outcome, setOutcome] = useState("");
  const [remarks, setRemarks] = useState("");

  if (!enquiry) return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ color: "var(--text-sub)" }}>
      <p className="text-lg font-600">Enquiry not found.</p>
      <Link href="/enquiries" className="btn-primary mt-4">Back to Enquiries</Link>
    </div>
  );

  const activities = mockActivities.filter(a => a.enquiryId === enquiry.id);
  const followups  = mockFollowUps.filter(f => f.enquiryId === enquiry.id);
  const tasks      = mockTasks.filter(t => t.enquiryId === enquiry.id);
  const curIdx     = STATUS_FLOW.indexOf(enquiry.status as LeadStatus);
  const TABS = [
    { key: "timeline" as const,  label: `Timeline (${activities.length})` },
    { key: "tasks"    as const,  label: `Tasks (${tasks.length})` },
    { key: "followups"as const,  label: `Follow-ups (${followups.length})` },
  ];

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <Topbar title="Enquiry Detail" subtitle={enquiry.enquiryId} />

      <div className="p-6 fade-in">

        {/* ── Top bar ── */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <Link href="/enquiries" className="btn-secondary" style={{ padding: "8px 12px" }}>
              <ChevronLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold" style={{ color: "var(--text-h)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {enquiry.studentName}
                </h2>
                <StatusBadge status={enquiry.status} />
                {enquiry.hasSibling && (
                  <span className="chip" style={{ background: "#F5F3FF", color: "#7C3AED", borderColor: "#DDD6FE" }}>
                    Has Sibling
                  </span>
                )}
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--text-sub)" }}>
                {enquiry.enquiryId} &nbsp;·&nbsp; {enquiry.applyingClass} &nbsp;·&nbsp; AY {enquiry.academicYear}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary"><Edit3 size={15} /> Edit</button>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={15} /> Log Activity
            </button>
          </div>
        </div>

        {/* ── Pipeline progress ── */}
        {!["DNP","ADMISSION_CANCELLED"].includes(enquiry.status) && (
          <div className="card mb-5" style={{ padding: "18px 24px" }}>
            <p className="section-label mb-4">ADMISSION PIPELINE</p>
            <div className="flex items-center">
              {STATUS_FLOW.map((s, i) => {
                const done    = i < curIdx;
                const current = i === curIdx;
                const lineColor = done ? "#047857" : "#D8E0EB";
                return (
                  <div key={s} className="flex items-center flex-1">
                    <div className="flex flex-col items-center" style={{ flex: 1 }}>
                      <div
                        className="flex items-center justify-center font-bold"
                        style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: done ? "#047857" : current ? "var(--blue-700)" : "#EEF2F7",
                          border: `2px solid ${done ? "#047857" : current ? "var(--blue-700)" : "#D8E0EB"}`,
                          color: done || current ? "#fff" : "var(--text-muted)",
                          fontSize: 12, flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                      >
                        {done ? <CheckCircle2 size={14} /> : i + 1}
                      </div>
                      <p className="text-center leading-tight mt-1.5"
                        style={{
                          fontSize: 10.5, fontWeight: current ? 700 : done ? 600 : 500,
                          color: current ? "var(--blue-700)" : done ? "#047857" : "var(--text-muted)",
                          maxWidth: 56,
                        }}>
                        {STATUS_LABELS_SHORT[s]}
                      </p>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div style={{ height: 2, width: 20, background: lineColor, flexShrink: 0, marginBottom: 18, transition: "background 0.2s" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Main layout ── */}
        <div className="grid xl:grid-cols-3 gap-5">

          {/* ── Left: Info cards ── */}
          <div className="space-y-4">

            {/* Student */}
            <div className="card">
              <p className="section-label"><User size={11} style={{ display: "inline", marginRight: 6 }} />Student Information</p>
              <InfoRow label="Full Name"       value={<span className="font-700">{enquiry.studentName}</span>} />
              <InfoRow label="Gender"          value={enquiry.studentGender} />
              <InfoRow label="Current School"  value={enquiry.currentSchool} />
              <InfoRow label="Applying Class"  value={<span className="font-700" style={{ color: "var(--blue-700)" }}>{enquiry.applyingClass}</span>} />
              <InfoRow label="Academic Year"   value={enquiry.academicYear} />
            </div>

            {/* Parent */}
            <div className="card">
              <p className="section-label"><Users size={11} style={{ display: "inline", marginRight: 6 }} />Parent / Contact</p>
              <InfoRow label="Father's Name"   value={enquiry.fatherName} />
              <InfoRow label="Mother's Name"   value={enquiry.motherName} />
              <InfoRow label="Mobile"          value={
                <a href={`tel:${enquiry.primaryContact}`} style={{ color: "var(--blue-700)", fontWeight: 700, textDecoration: "none" }}>
                  {enquiry.primaryContact}
                </a>
              } />
              <InfoRow label="Email"           value={enquiry.email} />
              <InfoRow label="WhatsApp"        value={enquiry.whatsapp} />
              <InfoRow label="Location"        value={[enquiry.area, enquiry.city].filter(Boolean).join(", ")} />
            </div>

            {/* Lead */}
            <div className="card">
              <p className="section-label"><Tag size={11} style={{ display: "inline", marginRight: 6 }} />Lead Info</p>
              <InfoRow label="Lead Source"     value={leadSourceLabels[enquiry.leadSource]} />
              <InfoRow label="Campaign"        value={enquiry.campaign} />
              <InfoRow label="Counsellor"      value={
                enquiry.counsellorName ? (
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-700 text-white"
                      style={{ background: "var(--blue-700)" }}>
                      {enquiry.counsellorName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span>{enquiry.counsellorName}</span>
                  </div>
                ) : "Unassigned"
              } />
              <InfoRow label="Enquiry Date"    value={formatDate(enquiry.enquiryDate)} />
              {enquiry.remarks && (
                <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: "var(--blue-50)", color: "var(--text-body)", border: "1px solid #BFDBFE" }}>
                  <span className="font-600">Remarks:</span> {enquiry.remarks}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="card">
              <p className="section-label mb-3">QUICK STATUS CHANGE</p>
              <div className="space-y-2">
                {(["FOLLOW_UP","WALK_IN_SCHEDULED","REGISTRATION_PENDING","ADMISSION_CONFIRMED","DNP"] as LeadStatus[]).map(s => (
                  <button key={s} className="w-full text-left text-sm font-500 px-3 py-2.5 rounded-lg transition-all"
                    style={{
                      background: enquiry.status === s ? "var(--blue-50)" : "#F5F8FC",
                      color: enquiry.status === s ? "var(--blue-700)" : "var(--text-body)",
                      border: `1px solid ${enquiry.status === s ? "#BFDBFE" : "var(--border)"}`,
                      fontWeight: enquiry.status === s ? 700 : 500,
                    }}>
                    {enquiry.status === s ? "✓ " : ""}{statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Tabs ── */}
          <div className="xl:col-span-2">
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Tab header */}
              <div className="flex" style={{ background: "#F8FAFC", borderBottom: "1px solid var(--border)" }}>
                {TABS.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    style={{
                      padding: "13px 22px", fontSize: 14, fontWeight: tab === t.key ? 700 : 500,
                      color: tab === t.key ? "var(--blue-700)" : "var(--text-sub)",
                      borderBottom: `2.5px solid ${tab === t.key ? "var(--blue-700)" : "transparent"}`,
                      background: "transparent", border: "none",
                      borderBottomWidth: "2.5px", borderBottomStyle: "solid",
                      borderBottomColor: tab === t.key ? "var(--blue-700)" : "transparent",
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* Timeline */}
                {tab === "timeline" && (
                  activities.length === 0 ? (
                    <div className="flex flex-col items-center py-14" style={{ color: "var(--text-muted)" }}>
                      <Activity size={36} style={{ opacity: 0.3, marginBottom: 10 }} />
                      <p className="font-600 text-base" style={{ color: "var(--text-sub)" }}>No activities yet</p>
                      <p className="text-sm mt-1">Log the first contact with this family</p>
                      <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
                        <Plus size={15} /> Log Activity
                      </button>
                    </div>
                  ) : (
                    <div>
                      {activities.map(a => (
                        <div key={a.id} className="timeline-item">
                          <div className="timeline-dot" style={{ borderColor: ACTIVITY_COLORS[a.type] || "#1A56DB", color: ACTIVITY_COLORS[a.type] || "#1A56DB" }}>
                            {ACTIVITY_ICONS[a.type]}
                          </div>
                          <div className="ml-2">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-700 text-sm" style={{ color: "var(--text-h)" }}>
                                {activityTypeLabels[a.type]}
                              </span>
                              <span className="chip" style={{ background: "var(--blue-50)", color: "var(--blue-700)", borderColor: "#BFDBFE", fontSize: 11 }}>
                                {a.outcome}
                              </span>
                            </div>
                            {a.remarks && (
                              <p className="text-sm mb-1" style={{ color: "var(--text-body)" }}>{a.remarks}</p>
                            )}
                            {a.nextAction && (
                              <p className="text-sm flex items-center gap-1 font-600" style={{ color: "#D97706" }}>
                                <Clock size={12} /> Next: {a.nextAction}
                              </p>
                            )}
                            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                              {a.userName} &nbsp;·&nbsp; {formatDateTime(a.dateTime)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Tasks */}
                {tab === "tasks" && (
                  tasks.length === 0 ? (
                    <div className="flex flex-col items-center py-14" style={{ color: "var(--text-muted)" }}>
                      <ClipboardList size={36} style={{ opacity: 0.3, marginBottom: 10 }} />
                      <p className="font-600 text-base" style={{ color: "var(--text-sub)" }}>No tasks yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(t => (
                        <div key={t.id} className="flex items-start gap-3 p-4 rounded-xl"
                          style={{ background: "#F8FAFC", border: "1px solid var(--border)" }}>
                          <div style={{ marginTop: 2 }}>
                            {t.status === "COMPLETED"
                              ? <CheckCircle2 size={18} style={{ color: "#15803D" }} />
                              : <div className="w-4.5 h-4.5 rounded-full border-2" style={{ width: 18, height: 18, borderColor: t.priority === "HIGH" ? "#DC2626" : t.priority === "MEDIUM" ? "#D97706" : "#1A56DB" }} />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="font-600 text-sm" style={{ color: "var(--text-h)", textDecoration: t.status === "COMPLETED" ? "line-through" : "none" }}>
                              {t.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="chip" style={{
                                background: t.priority === "HIGH" ? "#FEF2F2" : t.priority === "MEDIUM" ? "#FFFBEB" : "var(--blue-50)",
                                color: t.priority === "HIGH" ? "#B91C1C" : t.priority === "MEDIUM" ? "#B45309" : "var(--blue-700)",
                                borderColor: t.priority === "HIGH" ? "#FECACA" : t.priority === "MEDIUM" ? "#FDE68A" : "#BFDBFE",
                                fontSize: 11,
                              }}>
                                {t.priority} Priority
                              </span>
                              <span className="text-xs" style={{ color: "var(--text-sub)" }}>
                                <Calendar size={10} style={{ display: "inline", marginRight: 3 }} />
                                {formatDateTime(t.dueDateTime)}
                              </span>
                              <span className="text-xs" style={{ color: "var(--text-sub)" }}>
                                👤 {t.assignedUserName}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Follow-ups */}
                {tab === "followups" && (
                  followups.length === 0 ? (
                    <div className="flex flex-col items-center py-14" style={{ color: "var(--text-muted)" }}>
                      <Calendar size={36} style={{ opacity: 0.3, marginBottom: 10 }} />
                      <p className="font-600 text-base" style={{ color: "var(--text-sub)" }}>No follow-ups scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {followups.map(f => (
                        <div key={f.id} className="flex items-center gap-4 p-4 rounded-xl"
                          style={{ background: "#F8FAFC", border: "1px solid var(--border)" }}>
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: f.completed ? "#F0FDF4" : "#FFFBEB" }}>
                            {f.completed
                              ? <CheckCircle2 size={20} style={{ color: "#15803D" }} />
                              : <Clock size={20} style={{ color: "#D97706" }} />}
                          </div>
                          <div className="flex-1">
                            <p className="font-700 text-sm" style={{ color: "var(--text-h)" }}>
                              {f.type} Follow-up
                              {!f.completed && <span className="chip ml-2" style={{ background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A", fontSize: 11 }}>Pending</span>}
                            </p>
                            <p className="text-sm mt-0.5" style={{ color: "var(--text-sub)" }}>
                              📅 {f.date} at {f.time} &nbsp;·&nbsp; 👤 {f.assignedUserName}
                            </p>
                            {f.notes && <p className="text-sm mt-1" style={{ color: "var(--text-body)" }}>{f.notes}</p>}
                          </div>
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

      {/* ── Log Activity Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "var(--text-h)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Log Activity
                </h3>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-sub)" }}>
                  for {enquiry.studentName}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: "6px 10px" }}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Type */}
              <div>
                <label>Activity Type *</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(["PHONE_CALL","WHATSAPP","EMAIL","MEETING","WALK_IN","NOTE"] as ActivityType[]).map(t => (
                    <button key={t} onClick={() => setActType(t)}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-600 transition-all border"
                      style={{
                        background: activityType === t ? "var(--blue-50)" : "#F8FAFC",
                        borderColor: activityType === t ? "#BFDBFE" : "var(--border)",
                        color: activityType === t ? "var(--blue-700)" : "var(--text-body)",
                      }}>
                      <span style={{ color: ACTIVITY_COLORS[t] || "#1A56DB" }}>{ACTIVITY_ICONS[t]}</span>
                      {activityTypeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outcome */}
              <div>
                <label>Outcome *</label>
                <input
                  value={outcome}
                  onChange={e => setOutcome(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Connected, No Answer, Very Interested..."
                />
              </div>

              {/* Remarks */}
              <div>
                <label>Remarks / Notes</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="What was discussed, parent's concerns, next steps..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button className="btn-primary flex-1">
                  <Send size={15} /> Save Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
