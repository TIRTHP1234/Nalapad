"use client";
import { useState, useEffect } from "react";
import { X, Building2, CheckCircle2, Loader2, AlertCircle, Calendar } from "lucide-react";

interface ScheduleWalkInModalProps {
  initialEnquiry?: {
    id: string;
    studentName: string;
    enquiryId: string;
    primaryContact: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleWalkInModal({
  initialEnquiry,
  onClose,
  onSuccess,
}: ScheduleWalkInModalProps) {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [counsellors, setCounsellors] = useState<any[]>([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(initialEnquiry?.id || "");
  const [visitorName, setVisitorName] = useState(initialEnquiry?.studentName ? `${initialEnquiry.studentName}'s Family` : "");
  const [visitDate, setVisitDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [counsellorId, setCounsellorId] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [outcome, setOutcome] = useState("INTERESTED");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        if (!initialEnquiry) {
          const enqRes = await fetch("/api/enquiries");
          const enqJson = await enqRes.json();
          if (enqJson.data && Array.isArray(enqJson.data)) {
            setEnquiries(enqJson.data);
            if (enqJson.data.length > 0 && !selectedEnquiryId) {
              setSelectedEnquiryId(enqJson.data[0].id);
              setVisitorName(`${enqJson.data[0].student_name}'s Family`);
            }
          }
        }
        const counsRes = await fetch("/api/counsellors");
        const counsJson = await counsRes.json();
        if (counsJson.data && Array.isArray(counsJson.data)) {
          setCounsellors(counsJson.data);
          if (counsJson.data.length > 0) setCounsellorId(counsJson.data[0].id);
        }
      } catch (e) {
        console.error("Failed to load options:", e);
      }
    }
    init();
  }, [initialEnquiry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiryId) {
      setError("Please select an enquiry lead");
      return;
    }
    if (!visitorName.trim()) {
      setError("Please enter visitor name");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/walkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: selectedEnquiryId,
          visitorName: visitorName.trim(),
          visitDate: new Date(visitDate).toISOString(),
          counsellorId: counsellorId || undefined,
          completed: isCompleted,
          outcome: isCompleted ? outcome : undefined,
          remarks: remarks.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to schedule walk-in");

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to schedule walk-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 bg-slate-50/80 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shadow-xs">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">Schedule Campus Walk-in</h3>
              <p className="text-xs text-slate-500 mt-1">Record a family school visit and campus tour</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Enquiry if not initial */}
          {!initialEnquiry ? (
            <div>
              <label className="form-label">
                Select Student Enquiry <span className="text-rose-500 font-normal ml-0.5">*</span>
              </label>
              <select
                value={selectedEnquiryId}
                onChange={(e) => {
                  setSelectedEnquiryId(e.target.value);
                  const sel = enquiries.find((x) => x.id === e.target.value);
                  if (sel) setVisitorName(`${sel.student_name}'s Family`);
                }}
                className="input-field"
                required
              >
                {enquiries.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.student_name} ({e.enquiry_id}) — Grade {e.applying_class}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Student Lead</span>
              <span className="font-semibold text-slate-900 mt-1 block text-sm">{initialEnquiry.studentName} ({initialEnquiry.enquiryId})</span>
            </div>
          )}

          {/* Visitor Name & Datetime */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="form-label">
                Visitor Name(s) <span className="text-rose-500 font-normal ml-0.5">*</span>
              </label>
              <input
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g. Mr. & Mrs. Sharma"
                className="input-field"
              />
            </div>

            <div>
              <label className="form-label">
                Visit Date & Time <span className="text-rose-500 font-normal ml-0.5">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Assigned Counsellor */}
          <div>
            <label className="form-label">Host / Assigned Counsellor</label>
            <select
              value={counsellorId}
              onChange={(e) => setCounsellorId(e.target.value)}
              className="input-field"
            >
              <option value="">Unassigned</option>
              {counsellors.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
              ))}
            </select>
          </div>

          {/* Visit State: Scheduled vs Completed */}
          <div>
            <label className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 border-slate-300 focus:ring-orange-500/20 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  This visit has already taken place
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Record outcome, family interest level, and tour observations now
                </span>
              </div>
            </label>
          </div>

          {isCompleted && (
            <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100 space-y-3 animate-fade-in">
              <label className="form-label text-orange-950 font-semibold">Visit Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="input-field bg-white"
              >
                <option value="INTERESTED">Interested in Admission</option>
                <option value="REGISTRATION">Proceeded to Registration Form</option>
                <option value="NEEDS_FOLLOW_UP">Needs Follow-up Call</option>
                <option value="NOT_INTERESTED">Not Interested / Chose Another School</option>
              </select>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="form-label">Tour Notes / Comments</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Visited science labs and sports complex. Parent impressed."
              className="input-field"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary px-5">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-6">
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Save Walk-in
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
