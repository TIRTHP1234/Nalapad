"use client";
import Topbar from "@/components/Topbar";
import { mockTasks, mockEnquiries } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, X, ClipboardList, Calendar } from "lucide-react";
import Link from "next/link";

const priorityConfig = {
  HIGH: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "High" },
  MEDIUM: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Medium" },
  LOW: { color: "#6366f1", bg: "rgba(99,102,241,0.1)", label: "Low" },
};

const statusConfig = {
  OPEN: { color: "#3b82f6", icon: <Clock size={14} />, label: "Open" },
  IN_PROGRESS: { color: "#f59e0b", icon: <AlertCircle size={14} />, label: "In Progress" },
  COMPLETED: { color: "#10b981", icon: <CheckCircle2 size={14} />, label: "Completed" },
  CANCELLED: { color: "#64748b", icon: <X size={14} />, label: "Cancelled" },
};

export default function TasksPage() {
  const open = mockTasks.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS");
  const done = mockTasks.filter(t => t.status === "COMPLETED" || t.status === "CANCELLED");

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Tasks" subtitle="All counsellor tasks" action={{ label: "New Task", href: "#" }} />
      <div className="flex-1 p-6 space-y-5 fade-in">

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Open", count: mockTasks.filter(t => t.status === "OPEN").length, color: "#3b82f6" },
            { label: "In Progress", count: mockTasks.filter(t => t.status === "IN_PROGRESS").length, color: "#f59e0b" },
            { label: "Completed", count: mockTasks.filter(t => t.status === "COMPLETED").length, color: "#10b981" },
            { label: "High Priority", count: mockTasks.filter(t => t.priority === "HIGH").length, color: "#ef4444" },
          ].map(({ label, count, color }) => (
            <div key={label} className="card text-center" style={{ padding: "18px" }}>
              <p className="text-2xl font-bold" style={{ color }}>{count}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Active Tasks */}
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Active Tasks ({open.length})</h3>
          <div className="space-y-2">
            {open.map((t) => {
              const enquiry = mockEnquiries.find(e => e.id === t.enquiryId);
              const p = priorityConfig[t.priority];
              const s = statusConfig[t.status];
              return (
                <div key={t.id} className="card flex items-start gap-4" style={{ padding: "14px 16px" }}>
                  <div style={{ color: s.color, marginTop: "2px" }}>{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{t.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold" style={{ background: p.bg, color: p.color }}>
                        {p.label} Priority
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        <Calendar size={9} className="inline mr-1" />{formatDateTime(t.dueDateTime)}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>👤 {t.assignedUserName}</span>
                      {enquiry && (
                        <Link href={`/enquiries/${enquiry.id}`} className="text-[10px]" style={{ color: "#6366f1" }}>
                          {enquiry.studentName} →
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                      Complete
                    </button>
                  </div>
                </div>
              );
            })}
            {open.length === 0 && (
              <div className="card text-center py-10" style={{ color: "var(--text-muted)" }}>
                <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No active tasks. 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        {done.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Completed / Cancelled ({done.length})</h3>
            <div className="space-y-2">
              {done.map((t) => {
                const enquiry = mockEnquiries.find(e => e.id === t.enquiryId);
                const s = statusConfig[t.status];
                return (
                  <div key={t.id} className="card flex items-center gap-4 opacity-60" style={{ padding: "12px 16px" }}>
                    <div style={{ color: s.color }}>{s.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm line-through" style={{ color: "var(--text-secondary)" }}>{t.description}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {t.assignedUserName} · {enquiry?.studentName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
