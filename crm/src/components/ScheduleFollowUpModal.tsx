"use client";
import { useState, useEffect } from "react";
import { X, Calendar, CheckCircle2, Loader2, AlertCircle, Phone, MessageCircle, Mail, Users } from "lucide-react";

interface ScheduleFollowUpModalProps {
  initialEnquiry?: {
    id: string;
    studentName: string;
    enquiryId: string;
  };
  existingFollowUp?: {
    id: string;
    followUpDate: string;
    followUpTime?: string;
    type: string;
    notes?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleFollowUpModal({
  initialEnquiry,
  existingFollowUp,
  onClose,
  onSuccess,
}: ScheduleFollowUpModalProps) {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [counsellors, setCounsellors] = useState<any[]>([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(initialEnquiry?.id || "");
  const [followUpDate, setFollowUpDate] = useState(() => {
    if (existingFollowUp?.followUpDate) return existingFollowUp.followUpDate;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [followUpTime, setFollowUpTime] = useState(existingFollowUp?.followUpTime || "11:00");
  const [type, setType] = useState(existingFollowUp?.type || "CALL");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState(existingFollowUp?.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isReschedule = Boolean(existingFollowUp?.id);

  useEffect(() => {
    async function loadData() {
      try {
        if (!initialEnquiry && !existingFollowUp) {
          const res = await fetch("/api/enquiries");
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setEnquiries(json.data);
            if (json.data.length > 0 && !selectedEnquiryId) {
              setSelectedEnquiryId(json.data[0].id);
            }
          }
        }
        const counsRes = await fetch("/api/counsellors");
        const counsJson = await counsRes.json();
        if (counsJson.data && Array.isArray(counsJson.data)) {
          setCounsellors(counsJson.data);
          if (counsJson.data.length > 0) setAssignedTo(counsJson.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      }
    }
    loadData();
  }, [initialEnquiry, existingFollowUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isReschedule && existingFollowUp) {
        const res = await fetch(`/api/followups/${existingFollowUp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            followUpDate,
            followUpTime,
            type,
            notes,
            rescheduled: true,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to reschedule follow-up");
      } else {
        if (!selectedEnquiryId) {
          setError("Please select an enquiry");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/followups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enquiryId: selectedEnquiryId,
            followUpDate,
            followUpTime,
            type,
            assignedTo: assignedTo || undefined,
            notes: notes.trim() || undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to schedule follow-up");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Operation failed");
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
            <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#1A56DB] flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0D1B2E]">
                {isReschedule ? "Reschedule Follow-up" : "Schedule Follow-up"}
              </h3>
              <p className="text-xs text-slate-500">
                {isReschedule ? "Update the call date and time" : "Set automated reminder for admission enquiry"}
              </p>
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

          {/* Select Enquiry if creating new */}
          {/* Select Enquiry if creating new */}
          {!isReschedule && !initialEnquiry && (
            <div>
              <span className="form-label">
                Select Student Enquiry <span className="text-red-500">*</span>
              </span>
              <select
                value={selectedEnquiryId}
                onChange={(e) => setSelectedEnquiryId(e.target.value)}
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
          )}

          {initialEnquiry && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block">Student Lead:</span>
              <span className="font-bold text-slate-900">{initialEnquiry.studentName} ({initialEnquiry.enquiryId})</span>
            </div>
          )}

          {/* Communication Channel */}
          <div>
            <span className="form-label">Interaction Type</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "CALL", label: "Phone", icon: Phone },
                { id: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
                { id: "EMAIL", label: "Email", icon: Mail },
                { id: "VISIT", label: "Campus", icon: Users },
              ].map((c) => {
                const Icon = c.icon;
                const active = type === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setType(c.id)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      active
                        ? "border-[#1A56DB] bg-[#EBF1FF] text-[#1A56DB]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="form-label">
                Follow-up Date <span className="text-red-500">*</span>
              </span>
              <input
                type="date"
                required
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div>
              <span className="form-label">Time</span>
              <input
                type="time"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          {/* Assigned Counsellor */}
          {!isReschedule && (
            <div>
              <span className="form-label">Assign To</span>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="input-field text-xs"
              >
                <option value="">Unassigned</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes / Agenda */}
          <div>
            <span className="form-label">Notes / Agenda</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Call father regarding bus route and fee structure"
              className="input-field text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary text-xs py-2 px-4">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary text-xs py-2 px-5 flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> {isReschedule ? "Update Schedule" : "Confirm Schedule"}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
