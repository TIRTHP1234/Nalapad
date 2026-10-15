"use client";
import Topbar from "@/components/Topbar";
import { mockFollowUps, mockEnquiries } from "@/lib/mock-data";
import { Calendar, Clock, Phone, MessageCircle, Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

const typeIcons: Record<string, React.ReactNode> = {
  CALL: <Phone size={14} />,
  WHATSAPP: <MessageCircle size={14} />,
  EMAIL: <Mail size={14} />,
  VISIT: <Calendar size={14} />,
};

const typeColors: Record<string, string> = {
  CALL: "#6366f1",
  WHATSAPP: "#10b981",
  EMAIL: "#3b82f6",
  VISIT: "#8b5cf6",
};

const today = new Date().toISOString().split("T")[0];

const overdue = mockFollowUps.filter(f => !f.completed && f.date < today);
const dueToday = mockFollowUps.filter(f => !f.completed && f.date === today);
const upcoming = mockFollowUps.filter(f => !f.completed && f.date > today);

const FollowUpCard = ({ f, tag }: { f: typeof mockFollowUps[0]; tag?: string }) => {
  const enquiry = mockEnquiries.find(e => e.id === f.enquiryId);
  return (
    <div className="card flex items-start gap-3" style={{ padding: "14px 16px" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${typeColors[f.type]}18`, color: typeColors[f.type] }}>
        {typeIcons[f.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-white">{enquiry?.studentName || "Unknown"}</p>
          {tag && (
            <span className="text-[10px] px-2 py-0.5 rounded font-semibold"
              style={{ background: tag === "OVERDUE" ? "rgba(239,68,68,0.1)" : tag === "TODAY" ? "rgba(245,158,11,0.1)" : "rgba(99,102,241,0.1)", color: tag === "OVERDUE" ? "#f87171" : tag === "TODAY" ? "#fbbf24" : "#a5b4fc" }}>
              {tag === "OVERDUE" ? "⚠ Overdue" : tag === "TODAY" ? "📅 Due Today" : "🔜 Upcoming"}
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {f.type} Follow-up · {f.date} at {f.time}
        </p>
        {f.notes && <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{f.notes}</p>}
        <p className="text-[11px] mt-1.5" style={{ color: "var(--text-muted)" }}>
          Assigned to: {f.assignedUserName}
          {enquiry && <> · <Link href={`/enquiries/${enquiry.id}`} style={{ color: "#6366f1" }}>View Enquiry →</Link></>}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <button className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
          <CheckCircle2 size={11} className="inline mr-1" />Done
        </button>
        <button className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
          style={{ background: "rgba(30,45,74,0.5)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
          Reschedule
        </button>
      </div>
    </div>
  );
};

export default function FollowUpsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Follow-ups" subtitle="Manage all scheduled follow-ups" action={{ label: "Schedule Follow-up", href: "#" }} />
      <div className="flex-1 p-6 space-y-6 fade-in">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Overdue", count: overdue.length, color: "#ef4444", icon: AlertTriangle },
            { label: "Due Today", count: dueToday.length, color: "#f59e0b", icon: Clock },
            { label: "Upcoming", count: upcoming.length, color: "#6366f1", icon: Calendar },
          ].map(({ label, count, color, icon: Icon }) => (
            <div key={label} className="card text-center" style={{ padding: "20px" }}>
              <Icon size={22} className="mx-auto mb-2" style={{ color }} />
              <p className="text-2xl font-bold" style={{ color }}>{count}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Overdue */}
        {overdue.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#f87171" }}>
              <AlertTriangle size={14} /> Overdue Follow-ups ({overdue.length})
            </h3>
            <div className="space-y-2">{overdue.map(f => <FollowUpCard key={f.id} f={f} tag="OVERDUE" />)}</div>
          </div>
        )}

        {/* Due Today */}
        {dueToday.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#fbbf24" }}>
              <Clock size={14} /> Due Today ({dueToday.length})
            </h3>
            <div className="space-y-2">{dueToday.map(f => <FollowUpCard key={f.id} f={f} tag="TODAY" />)}</div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#a5b4fc" }}>
              <Calendar size={14} /> Upcoming Follow-ups ({upcoming.length})
            </h3>
            <div className="space-y-2">{upcoming.map(f => <FollowUpCard key={f.id} f={f} tag="UPCOMING" />)}</div>
          </div>
        )}

        {mockFollowUps.length === 0 && (
          <div className="card text-center py-16" style={{ color: "var(--text-muted)" }}>
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p>No follow-ups scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
}
