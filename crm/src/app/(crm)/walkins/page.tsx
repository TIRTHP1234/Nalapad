"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { Building2, Plus, CheckCircle2, Clock, Users, Loader2, Calendar, FileText, X } from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/utils";
import Link from "next/link";
import ScheduleWalkInModal from "@/components/ScheduleWalkInModal";

interface WalkInRecord {
  id: string;
  enquiry_id: string;
  visit_date: string;
  visitor_name: string;
  counsellor_id?: string;
  outcome?: string;
  remarks?: string;
  next_action?: string;
  enquiry?: {
    id: string;
    enquiry_id: string;
    student_name: string;
    primary_contact: string;
    applying_class: string;
    status: string;
  };
  counsellor?: {
    id: string;
    full_name: string;
  };
}

export default function WalkInsPage() {
  const [walkins, setWalkins] = useState<WalkInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [outcomeTarget, setOutcomeTarget] = useState<WalkInRecord | null>(null);
  const [outcomeVal, setOutcomeVal] = useState("INTERESTED");
  const [outcomeRemarks, setOutcomeRemarks] = useState("");
  const [savingOutcome, setSavingOutcome] = useState(false);

  async function loadWalkIns() {
    try {
      const res = await fetch("/api/walkins");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setWalkins(json.data);
      }
    } catch (err) {
      console.error("Failed to load walk-in records:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWalkIns();
  }, []);

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomeTarget) return;

    setSavingOutcome(true);
    try {
      const res = await fetch(`/api/walkins/${outcomeTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: outcomeVal,
          remarks: outcomeRemarks.trim() || undefined,
        }),
      });
      if (res.ok) {
        setOutcomeTarget(null);
        setOutcomeRemarks("");
        loadWalkIns();
      }
    } catch (err) {
      console.error("Failed to update outcome:", err);
    } finally {
      setSavingOutcome(false);
    }
  };

  const scheduled = walkins.filter(w => !w.outcome);
  const completed = walkins.filter(w => Boolean(w.outcome));

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Topbar
        title="Campus Walk-ins"
        subtitle="Manage prospective parent school visits, campus tours & visit outcomes"
        action={{ label: "New Enquiry", href: "/enquiries/new" }}
      />
      <div className="p-7 space-y-7 fade-in max-w-[1600px] mx-auto w-full">

        {/* Action Header Banner */}
        <div className="card flex items-center justify-between p-5 flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0D1B2E]">Campus Tour Reception</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track and host physical campus visits from interested parents</p>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
          >
            <Plus size={16} /> Schedule Campus Walk-in
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Scheduled Tours", count: scheduled.length, color: "#7C3AED", bg: "#F5F3FF", icon: Clock },
            { label: "Completed Visits", count: completed.length, color: "#047857", bg: "#ECFDF5", icon: CheckCircle2 },
            { label: "Total Visits Logged", count: walkins.length, color: "#1A56DB", bg: "#EBF1FF", icon: Building2 },
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

        {/* Records Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <h3 className="text-base font-bold" style={{ color: "var(--text-h)" }}>Campus Walk-in Log</h3>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-sub)" }}>Live visits recorded across school enquiries</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: "var(--text-sub)" }}>
              <Loader2 className="animate-spin mb-3" size={28} color="#1A56DB" />
              <p className="text-sm font-semibold">Loading walk-ins...</p>
            </div>
          ) : walkins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: "var(--text-muted)" }}>
              <Building2 size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p className="text-base font-600" style={{ color: "var(--text-h)" }}>No campus walk-ins scheduled yet</p>
              <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-sub)" }}>
                Schedule campus visits for interested parents and students.
              </p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> Schedule First Walk-in
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Visitor & Student</th>
                  <th>Applying Grade</th>
                  <th>Assigned Host</th>
                  <th>Visit Status / Outcome</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {walkins.map((w) => {
                  const isDone = Boolean(w.outcome);
                  return (
                    <tr key={w.id}>
                      <td>
                        <p className="font-bold text-sm" style={{ color: "var(--text-h)" }}>{w.visitor_name}</p>
                        <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--text-muted)" }}>
                          Student: {w.enquiry?.student_name} ({w.enquiry?.enquiry_id})
                        </p>
                        {w.remarks && (
                          <p className="text-[11px] mt-1 text-slate-500 italic max-w-xs truncate">
                            Note: {w.remarks}
                          </p>
                        )}
                      </td>
                      <td className="text-sm font-semibold">Grade {w.enquiry?.applying_class || "N/A"}</td>
                      <td className="text-sm" style={{ color: "var(--text-body)" }}>
                        {w.counsellor?.full_name || <span style={{ color: "var(--text-muted)" }}>Front Desk Host</span>}
                      </td>
                      <td>
                        {isDone ? (
                          <span
                            className="chip"
                            style={{
                              background: "#ECFDF5",
                              color: "#047857",
                              borderColor: "#A7F3D0",
                              fontSize: 11,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <CheckCircle2 size={12} /> {w.outcome?.replace(/_/g, " ")}
                          </span>
                        ) : (
                          <span
                            className="chip"
                            style={{
                              background: "#F5F3FF",
                              color: "#7C3AED",
                              borderColor: "#DDD6FE",
                              fontSize: 11,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Clock size={12} /> Tour Scheduled
                          </span>
                        )}
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-sub)" }}>
                        {formatDateTime(w.visit_date)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {!isDone && (
                            <button
                              onClick={() => {
                                setOutcomeTarget(w);
                                setOutcomeVal("INTERESTED");
                                setOutcomeRemarks("");
                              }}
                              className="btn-secondary text-[11px] py-1 px-2.5 text-purple-700 hover:bg-purple-50"
                              style={{ minHeight: "30px" }}
                            >
                              Record Outcome
                            </button>
                          )}
                          {w.enquiry && (
                            <Link href={`/enquiries/${w.enquiry.id}`} className="text-xs font-semibold" style={{ color: "var(--blue-700)" }}>
                              View Lead →
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleWalkInModal
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            loadWalkIns();
          }}
        />
      )}

      {/* Record Outcome Modal */}
      {outcomeTarget && (
        <div className="modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-slide-up">
            <div className="px-7 py-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-heading">Record Visit Outcome</h3>
                <p className="text-xs text-slate-500 mt-1">{outcomeTarget.visitor_name}</p>
              </div>
              <button 
                type="button"
                onClick={() => setOutcomeTarget(null)} 
                className="modal-close-btn"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveOutcome} className="p-7 sm:p-8 space-y-6">
              <div>
                <label className="form-label">Family Decision / Outcome</label>
                <select
                  value={outcomeVal}
                  onChange={(e) => setOutcomeVal(e.target.value)}
                  className="input-field"
                >
                  <option value="INTERESTED">Interested in Admission</option>
                  <option value="REGISTRATION">Proceeding to Registration Fee</option>
                  <option value="NEEDS_FOLLOW_UP">Needs Follow-up Call</option>
                  <option value="NOT_INTERESTED">Not Interested / Discontinued</option>
                </select>
              </div>

              <div>
                <label className="form-label">Tour Feedback & Observations</label>
                <textarea
                  value={outcomeRemarks}
                  onChange={(e) => setOutcomeRemarks(e.target.value)}
                  placeholder="e.g. Liked IB curriculum and football academy. Requested fee breakdown."
                  rows={4}
                  className="input-field resize-none"
                  style={{ height: "auto" }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOutcomeTarget(null)}
                  disabled={savingOutcome}
                  className="btn-secondary px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOutcome}
                  className="btn-primary px-6"
                >
                  {savingOutcome ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} /> Save Outcome
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
