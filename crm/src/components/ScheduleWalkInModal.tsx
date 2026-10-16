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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#D8E0EB]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8FAFD] border-b border-[#D8E0EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0D1B2E]">Schedule Campus Walk-in</h3>
              <p className="text-xs text-slate-500">Record a family school visit and tour</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Enquiry if not initial */}
          {/* Select Enquiry if not initial */}
          {!initialEnquiry ? (
            <div>
              <span className="form-label">
                Select Student Enquiry <span className="text-red-500">*</span>
              </span>
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
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block">Lead:</span>
              <span className="font-bold text-slate-900">{initialEnquiry.studentName} ({initialEnquiry.enquiryId})</span>
            </div>
          )}

          {/* Visitor Name & Datetime */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="form-label">
                Visitor Name(s) <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g. Mr. & Mrs. Sharma"
                className="input-field text-xs"
              />
            </div>

            <div>
              <span className="form-label">
                Visit Date & Time <span className="text-red-500">*</span>
              </span>
              <input
                type="datetime-local"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          {/* Assigned Counsellor */}
          <div>
            <span className="form-label">Host / Assigned Counsellor</span>
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
          <div className="pt-2">
            <div
              className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none"
              onClick={() => setIsCompleted(!isCompleted)}
            >
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-slate-300 text-[#1A56DB] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="cursor-pointer select-none">This visit has already taken place (Record outcome now)</span>
            </div>
          </div>

          {isCompleted && (
            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 space-y-3">
              <div>
                <span className="form-label text-purple-900">Visit Outcome</span>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="input-field text-xs bg-white"
                >
                  <option value="INTERESTED">Interested in Admission</option>
                  <option value="REGISTRATION">Proceeded to Registration Form</option>
                  <option value="NEEDS_FOLLOW_UP">Needs Follow-up Call</option>
                  <option value="NOT_INTERESTED">Not Interested / Chose Another School</option>
                </select>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <span className="form-label">Tour Notes / Comments</span>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Visited science labs and sports complex. Parent impressed."
              className="input-field text-xs"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary text-xs py-2 px-4">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary text-xs py-2 px-5 flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> Save Walk-in
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
