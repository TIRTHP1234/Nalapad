"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, X, ClipboardList, Calendar, Loader2, Plus, User } from "lucide-react";
import Link from "next/link";
import CreateTaskModal from "@/components/CreateTaskModal";

interface TaskItem {
  id: string;
  enquiry_id?: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  due_datetime: string;
  enquiry?: {
    id: string;
    enquiry_id: string;
    student_name: string;
    primary_contact: string;
  };
  assigned_user?: {
    id: string;
    full_name: string;
  };
}

const priorityConfig = {
  HIGH: { color: "#DC2626", bg: "#FEF2F2", label: "High" },
  MEDIUM: { color: "#D97706", bg: "#FFFBEB", label: "Medium" },
  LOW: { color: "#1A56DB", bg: "#EBF1FF", label: "Low" },
};

const statusConfig = {
  OPEN: { color: "#1A56DB", icon: <Clock size={14} />, label: "Open" },
  IN_PROGRESS: { color: "#D97706", icon: <AlertCircle size={14} />, label: "In Progress" },
  COMPLETED: { color: "#047857", icon: <CheckCircle2 size={14} />, label: "Completed" },
  CANCELLED: { color: "#6B7280", icon: <X size={14} />, label: "Cancelled" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  async function loadTasks() {
    try {
      const res = await fetch("/api/tasks");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setTasks(json.data);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const handleMarkDone = async (id: string) => {
    setCompletingId(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "COMPLETED" } : t));
      }
    } catch (e) {
      console.error("Failed to mark task done:", e);
    } finally {
      setCompletingId(null);
    }
  };

  const open = tasks.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS");
  const done = tasks.filter(t => t.status === "COMPLETED" || t.status === "CANCELLED");

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Topbar title="Tasks" subtitle="All staff and counsellor action items" action={{ label: "New Enquiry", href: "/enquiries/new" }} />
      <div className="p-7 space-y-7 fade-in max-w-[1600px] mx-auto w-full">

        {/* Action Header Banner */}
        <div className="card flex items-center justify-between p-5 flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0D1B2E]">Task Assignment Desk</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track counsellor follow-up actions and document verifications</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
          >
            <Plus size={16} /> Create New Task
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Open", count: tasks.filter(t => t.status === "OPEN").length, color: "#1A56DB", bg: "#EBF1FF" },
            { label: "In Progress", count: tasks.filter(t => t.status === "IN_PROGRESS").length, color: "#D97706", bg: "#FFFBEB" },
            { label: "Completed", count: tasks.filter(t => t.status === "COMPLETED").length, color: "#047857", bg: "#ECFDF5" },
            { label: "High Priority", count: tasks.filter(t => t.priority === "HIGH").length, color: "#DC2626", bg: "#FEF2F2" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className="kpi-card" style={{ "--kpi-color": color } as React.CSSProperties}>
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
            <p className="text-sm font-semibold">Loading tasks...</p>
          </div>
        ) : (
          <>
            {/* Active Tasks */}
            <div>
              <h3 className="text-base font-bold mb-3" style={{ color: "var(--text-h)" }}>
                Active Tasks ({open.length})
              </h3>
              <div className="space-y-2.5">
                {open.map((t) => {
                  const p = priorityConfig[t.priority] || priorityConfig.MEDIUM;
                  const s = statusConfig[t.status] || statusConfig.OPEN;
                  const isCompleting = completingId === t.id;

                  return (
                    <div key={t.id} className="card flex items-start gap-4 transition-all hover:shadow-md" style={{ padding: "16px 20px" }}>
                      <div style={{ color: s.color, marginTop: "2px" }}>{s.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="text-sm font-bold" style={{ color: "var(--text-h)" }}>{t.description}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="chip" style={{ background: p.bg, color: p.color, fontSize: 11 }}>
                                {p.label} Priority
                              </span>
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                <Calendar size={11} className="inline mr-1" />{t.due_datetime ? formatDateTime(t.due_datetime) : "No due date"}
                              </span>
                              <span className="text-xs inline-flex items-center gap-1" style={{ color: "var(--text-sub)" }}>
                                <User size={12} className="text-slate-400" /> {t.assigned_user?.full_name || "Unassigned"}
                              </span>
                              {t.enquiry && (
                                <Link href={`/enquiries/${t.enquiry.id}`} className="text-xs font-semibold" style={{ color: "var(--blue-700)" }}>
                                  {t.enquiry.student_name} →
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Quick Mark Done Button */}
                          <button
                            onClick={() => handleMarkDone(t.id)}
                            disabled={isCompleting}
                            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                            style={{ minHeight: "34px" }}
                          >
                            {isCompleting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} className="text-emerald-600" />}
                            Mark Done
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {open.length === 0 && (
                  <div className="card text-center py-12" style={{ color: "var(--text-muted)" }}>
                    <ClipboardList size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-base font-600" style={{ color: "var(--text-h)" }}>No active tasks</p>
                    <p className="text-xs mt-1 mb-3" style={{ color: "var(--text-sub)" }}>All assignments are up to date.</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Create Task
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Tasks */}
            {done.length > 0 && (
              <div>
                <h3 className="text-base font-bold mb-3" style={{ color: "var(--text-muted)" }}>
                  Completed / Cancelled ({done.length})
                </h3>
                <div className="space-y-2.5">
                  {done.map((t) => {
                    const s = statusConfig[t.status] || statusConfig.COMPLETED;
                    return (
                      <div key={t.id} className="card flex items-center gap-4 opacity-75" style={{ padding: "14px 20px" }}>
                        <div style={{ color: s.color }}>{s.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm line-through" style={{ color: "var(--text-sub)" }}>{t.description}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {t.assigned_user?.full_name || "Staff"} {t.enquiry ? `· ${t.enquiry.student_name}` : ""}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Done
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTasks();
          }}
        />
      )}
    </div>
  );
}
