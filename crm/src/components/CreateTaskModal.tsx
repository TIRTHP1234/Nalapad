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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#D8E0EB]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8FAFD] border-b border-[#D8E0EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#1A56DB] flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0D1B2E]">Create New Task</h3>
              <p className="text-xs text-slate-500">Assign action item to counsellor or staff</p>
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

          {/* Select Enquiry if not preselected */}
          {!initialEnquiry ? (
            <div>
              <span className="form-label">
                Related Enquiry <span className="text-red-500">*</span>
              </span>
              <select
                value={selectedEnquiryId}
                onChange={(e) => setSelectedEnquiryId(e.target.value)}
                className="input-field text-xs"
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
              <span className="text-slate-500 block">Related Enquiry:</span>
              <span className="font-bold text-slate-900">{initialEnquiry.studentName} ({initialEnquiry.enquiryId})</span>
            </div>
          )}

          {/* Task Description */}
          <div>
            <span className="form-label">
              Task Description <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Collect Transfer Certificate from parent"
              className="input-field text-xs"
            />
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="form-label">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="input-field text-xs font-semibold"
              >
                <option value="HIGH">High Priority (Urgent)</option>
                <option value="MEDIUM">Medium Priority (Standard)</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            <div>
              <span className="form-label">
                Due Date & Time <span className="text-red-500">*</span>
              </span>
              <input
                type="datetime-local"
                required
                value={dueDatetime}
                onChange={(e) => setDueDatetime(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <span className="form-label">Assignee</span>
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

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary text-xs py-2 px-4">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary text-xs py-2 px-5 flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> Create Task
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
