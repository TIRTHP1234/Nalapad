"use client";
import { useState, useEffect, Suspense } from "react";
import Topbar from "@/components/Topbar";
import {
  Calendar, Clock, Phone, MessageCircle, Mail, AlertTriangle, Loader2,
  CheckCircle2, RotateCw, Plus,
} from "lucide-react";
import Link from "next/link";
import ScheduleFollowUpModal from "@/components/ScheduleFollowUpModal";

interface FollowUpItem {
  id: string;
  enquiry_id: string;
  follow_up_date: string;
  follow_up_time?: string;
  type: string;
  notes?: string;
  completed: boolean;
  enquiry?: {
    id: string;
    enquiry_id: string;
    student_name: string;
    primary_contact: string;
    applying_class: string;
  };
  assigned_user?: {
    id: string;
    full_name: string;
  };
}

const typeIcons: Record<string, React.ReactNode> = {
  CALL: <Phone size={14} />,
  PHONE_CALL: <Phone size={14} />,
  WHATSAPP: <MessageCircle size={14} />,
  EMAIL: <Mail size={14} />,
  VISIT: <Calendar size={14} />,
};

const typeColors: Record<string, string> = {
  CALL: "#1A56DB",
  PHONE_CALL: "#1A56DB",
  WHATSAPP: "#16A34A",
  EMAIL: "#0891B2",
  VISIT: "#7C3AED",
};

const FollowUpCard = ({
  f,
  tag,
  onComplete,
  onReschedule,
}: {
  f: FollowUpItem;
  tag?: "OVERDUE" | "TODAY" | "UPCOMING";
  onComplete: (id: string) => void;
  onReschedule: (f: FollowUpItem) => void;
}) => {
  const icon = typeIcons[f.type] || <Clock size={14} />;
  const color = typeColors[f.type] || "#1A56DB";
  const [completing, setCompleting] = useState(false);

  const handleCompleteClick = async () => {
    setCompleting(true);
    await onComplete(f.id);
    setCompleting(false);
  };

  return (
    <div className="card flex items-start gap-4 transition-all hover:shadow-md" style={{ padding: "16px 20px" }}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold" style={{ color: "var(--text-h)" }}>
            {f.enquiry?.student_name || "Enquiry Lead"}
          </p>
          {tag && (
            <span
              className="chip"
              style={{
                background: tag === "OVERDUE" ? "#FEF2F2" : tag === "TODAY" ? "#FFFBEB" : "#EFF6FF",
                color: tag === "OVERDUE" ? "#DC2626" : tag === "TODAY" ? "#D97706" : "#1A56DB",
                borderColor: tag === "OVERDUE" ? "#FECACA" : tag === "TODAY" ? "#FDE68A" : "#BFDBFE",
                fontSize: 11,
              }}
            >
              {tag === "OVERDUE" ? (
                <span className="inline-flex items-center gap-1"><AlertTriangle size={11} /> Overdue</span>
              ) : tag === "TODAY" ? (
                <span className="inline-flex items-center gap-1"><Calendar size={11} /> Due Today</span>
              ) : (
                <span className="inline-flex items-center gap-1"><Clock size={11} /> Upcoming</span>
              )}
            </span>
          )}
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--text-sub)" }}>
          {f.type} Follow-up · {f.follow_up_date} {f.follow_up_time ? `at ${f.follow_up_time}` : ""}
        </p>
        {f.notes && (
          <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--text-body)" }}>{f.notes}</p>
        )}
        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap pt-2 border-t border-slate-100">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Assigned: <span className="font-semibold text-slate-700">{f.assigned_user?.full_name || "Unassigned"}</span>
            {f.enquiry && (
              <> · <Link href={`/enquiries/${f.enquiry.id}`} className="font-semibold" style={{ color: "var(--blue-700)" }}>
                View Enquiry →
              </Link></>
            )}
          </p>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReschedule(f)}
              className="btn-secondary text-[11px] py-1.5 px-2.5 flex items-center gap-1.5"
              style={{ minHeight: "32px" }}
            >
              <RotateCw size={12} /> Reschedule
            </button>
            <button
              onClick={handleCompleteClick}
              disabled={completing}
              className="btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 border-none"
              style={{ minHeight: "32px", background: "#047857" }}
            >
              {completing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Mark Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function FollowUpsContent() {
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<FollowUpItem | null>(null);

  async function fetchFollowUps() {
    try {
      const res = await fetch("/api/followups");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setFollowUps(json.data);
      }
    } catch (err) {
      console.error("Failed to load followups:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
    fetchFollowUps();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/followups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        setFollowUps((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (e) {
      console.error("Failed to complete follow-up:", e);
    }
  };

  const overdue = today ? followUps.filter(f => !f.completed && f.follow_up_date < today) : [];
  const dueToday = today ? followUps.filter(f => !f.completed && f.follow_up_date === today) : [];
  const upcoming = today ? followUps.filter(f => !f.completed && f.follow_up_date > today) : [];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Topbar
        title="Follow-ups"
        subtitle="Manage scheduled calls and interactions"
        action={{ label: "New Enquiry", href: "/enquiries/new" }}
      />
      <div className="p-7 space-y-7 fade-in max-w-[1600px] mx-auto w-full">

        {/* Action Header Banner */}
        <div className="card flex items-center justify-between p-5 flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0D1B2E]">Follow-up Engine</h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated schedules and reminders for prospective families</p>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
          >
            <Plus size={16} /> Schedule Follow-up
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Overdue", count: overdue.length, color: "#DC2626", bg: "#FEF2F2", icon: AlertTriangle },
            { label: "Due Today", count: dueToday.length, color: "#D97706", bg: "#FFFBEB", icon: Clock },
            { label: "Upcoming", count: upcoming.length, color: "#1A56DB", bg: "#EBF1FF", icon: Calendar },
          ].map(({ label, count, color, bg, icon: Icon }) => (
            <div key={label} className="kpi-card" style={{ "--kpi-color": color } as React.CSSProperties}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: bg }}>
                <Icon size={22} style={{ color }} />
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: "#0D1B2E", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {count}
              </p>
              <p className="text-sm font-500" style={{ color: "var(--text-sub)" }}>{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "var(--text-sub)" }}>
            <Loader2 className="animate-spin mb-3" size={28} color="#1A56DB" />
            <p className="text-sm font-semibold">Loading follow-ups...</p>
          </div>
        ) : (
          <>
            {/* Overdue */}
            {overdue.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "#DC2626" }}>
                  <AlertTriangle size={15} /> Overdue Follow-ups ({overdue.length})
                </h3>
                <div className="space-y-2.5">
                  {overdue.map(f => (
                    <FollowUpCard
                      key={f.id}
                      f={f}
                      tag="OVERDUE"
                      onComplete={handleComplete}
                      onReschedule={(target) => setRescheduleTarget(target)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Due Today */}
            {dueToday.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "#D97706" }}>
                  <Clock size={15} /> Due Today ({dueToday.length})
                </h3>
                <div className="space-y-2.5">
                  {dueToday.map(f => (
                    <FollowUpCard
                      key={f.id}
                      f={f}
                      tag="TODAY"
                      onComplete={handleComplete}
                      onReschedule={(target) => setRescheduleTarget(target)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--blue-700)" }}>
                  <Calendar size={15} /> Upcoming Follow-ups ({upcoming.length})
                </h3>
                <div className="space-y-2.5">
                  {upcoming.map(f => (
                    <FollowUpCard
                      key={f.id}
                      f={f}
                      tag="UPCOMING"
                      onComplete={handleComplete}
                      onReschedule={(target) => setRescheduleTarget(target)}
                    />
                  ))}
                </div>
              </div>
            )}

            {followUps.length === 0 && (
              <div className="card text-center py-16" style={{ color: "var(--text-muted)" }}>
                <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-base font-semibold" style={{ color: "var(--text-h)" }}>No follow-ups scheduled yet</p>
                <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-sub)" }}>
                  Schedule follow-ups on enquiry pages to track family reminders.
                </p>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2"
                >
                  <Plus size={15} /> Schedule First Follow-up
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleFollowUpModal
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            fetchFollowUps();
          }}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <ScheduleFollowUpModal
          existingFollowUp={{
            id: rescheduleTarget.id,
            followUpDate: rescheduleTarget.follow_up_date,
            followUpTime: rescheduleTarget.follow_up_time,
            type: rescheduleTarget.type,
            notes: rescheduleTarget.notes,
          }}
          initialEnquiry={
            rescheduleTarget.enquiry
              ? {
                  id: rescheduleTarget.enquiry.id,
                  studentName: rescheduleTarget.enquiry.student_name,
                  enquiryId: rescheduleTarget.enquiry.enquiry_id,
                }
              : undefined
          }
          onClose={() => setRescheduleTarget(null)}
          onSuccess={() => {
            setRescheduleTarget(null);
            fetchFollowUps();
          }}
        />
      )}
    </div>
  );
}

export default function FollowUpsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ color: "var(--text-sub)" }}>
        <Loader2 className="animate-spin mb-3" size={32} color="#1A56DB" />
        <p className="text-base font-600">Loading follow-ups...</p>
      </div>
    }>
      <FollowUpsContent />
    </Suspense>
  );
}
