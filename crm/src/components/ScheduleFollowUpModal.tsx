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
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 bg-slate-50/80 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shadow-xs">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">
                {isReschedule ? "Reschedule Follow-up" : "Schedule Follow-up"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isReschedule ? "Update the call date and time" : "Set automated reminder for admission enquiry"}
              </p>
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

          {/* Select Enquiry if creating new */}
          {!isReschedule && !initialEnquiry && (
            <div>
              <label className="form-label">
                Select Student Enquiry <span className="text-rose-500 font-normal ml-0.5">*</span>
              </label>
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
            <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Student Lead</span>
              <span className="font-semibold text-slate-900 mt-1 block text-sm">{initialEnquiry.studentName} ({initialEnquiry.enquiryId})</span>
            </div>
          )}

          {/* Communication Channel */}
          <div>
            <label className="form-label">Interaction Type</label>
            <div className="grid grid-cols-4 gap-3">
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
                    className={`pill-btn flex-col sm:flex-row py-3 px-3 text-xs w-full gap-2 rounded-xl ${active ? "active" : ""}`}
                  >
                    <Icon size={15} className={active ? "text-orange-600" : "text-slate-400"} />
                    <span className="font-medium">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="form-label">
                Follow-up Date <span className="text-rose-500 font-normal ml-0.5">*</span>
              </label>
              <input
                type="date"
                required
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Time</label>
              <input
                type="time"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Assigned Counsellor */}
          {!isReschedule && (
            <div>
              <label className="form-label">Assign To</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="input-field"
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
            <label className="form-label">Notes / Agenda</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Call father regarding bus route and fee structure"
              className="input-field"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary px-5">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-6">
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> {isReschedule ? "Update Schedule" : "Confirm Schedule"}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
