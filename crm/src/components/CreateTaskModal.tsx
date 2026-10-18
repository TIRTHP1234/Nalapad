"use client";
import { useState, useEffect } from "react";
import { X, ClipboardList, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface CreateTaskModalProps {
  initialEnquiry?: {
    id: string;
    studentName: string;
    enquiryId: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTaskModal({
  initialEnquiry,
  onClose,
  onSuccess,
}: CreateTaskModalProps) {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [counsellors, setCounsellors] = useState<any[]>([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(initialEnquiry?.id || "");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [dueDatetime, setDueDatetime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        if (!initialEnquiry) {
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
  }, [initialEnquiry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiryId) {
      setError("Please select an enquiry");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a task description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: selectedEnquiryId,
          description: description.trim(),
          priority,
          dueDatetime: new Date(dueDatetime).toISOString(),
          assignedTo: assignedTo || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create task");

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
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">Create New Task</h3>
              <p className="text-xs text-slate-500 mt-1">Assign action item to counsellor or admissions staff</p>
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

          {/* Select Enquiry if not preselected */}
          {!initialEnquiry ? (
            <div>
              <label className="form-label">
                Related Enquiry <span className="text-rose-500 font-normal ml-0.5">*</span>
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
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Related Enquiry</span>
              <span className="font-semibold text-slate-900 mt-1 block text-sm">{initialEnquiry.studentName} ({initialEnquiry.enquiryId})</span>
            </div>
          )}

          {/* Task Description */}
          <div>
            <label className="form-label">
              Task Description <span className="text-rose-500 font-normal ml-0.5">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Collect Transfer Certificate and medical dossier from parent"
              className="input-field"
            />
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="form-label">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="input-field font-medium"
              >
                <option value="HIGH">High Priority (Urgent)</option>
                <option value="MEDIUM">Medium Priority (Standard)</option>
                <option value="LOW">Low Priority (Routine)</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Due Date & Time <span className="text-rose-500 font-normal ml-0.5">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={dueDatetime}
                onChange={(e) => setDueDatetime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="form-label">Assignee</label>
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

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary px-5">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-6">
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Create Task
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
