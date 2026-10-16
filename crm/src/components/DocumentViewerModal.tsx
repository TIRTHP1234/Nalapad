"use client";
import { useState } from "react";
import { X, CheckCircle2, Download, AlertTriangle, ExternalLink, Loader2, FileText } from "lucide-react";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    status: string;
    file_url?: string | null;
    remarks?: string | null;
    uploaded_at?: string | null;
  } | null;
  studentName?: string;
  onStatusUpdated: () => void;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  document,
  studentName,
  onStatusUpdated,
}: DocumentViewerModalProps) {
  const [updating, setUpdating] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !document) return null;

  const isPdf = document.file_url?.toLowerCase().endsWith(".pdf");
  const isImage = !isPdf && !!document.file_url;

  const handleUpdateStatus = async (newStatus: "VERIFIED" | "PENDING", remarkText?: string) => {
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          remarks: remarkText || document.remarks || "",
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to update document status");
      }

      onStatusUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[var(--border)]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAFD] border-b border-[var(--border)] flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-base text-[var(--text-h)]">{document.name}</h3>
              <span
                className="chip text-[11px]"
                style={{
                  background:
                    document.status === "VERIFIED"
                      ? "#ECFDF5"
                      : document.status === "SUBMITTED"
                      ? "#EFF6FF"
                      : "#FEF2F2",
                  color:
                    document.status === "VERIFIED"
                      ? "#047857"
                      : document.status === "SUBMITTED"
                      ? "#1A56DB"
                      : "#DC2626",
                  borderColor:
                    document.status === "VERIFIED"
                      ? "#A7F3D0"
                      : document.status === "SUBMITTED"
                      ? "#BFDBFE"
                      : "#FECACA",
                }}
              >
                {document.status === "VERIFIED" ? (
                  <>
                    <CheckCircle2 size={12} className="inline mr-1" /> Verified
                  </>
                ) : document.status === "SUBMITTED" ? (
                  "Submitted · Awaiting Review"
                ) : (
                  "Pending Upload"
                )}
              </span>
            </div>
            {studentName && (
              <p className="text-xs text-[var(--text-sub)] mt-0.5">Candidate: {studentName}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {document.file_url && (
              <a
                href={document.file_url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs h-8 px-2.5 flex items-center gap-1.5"
                title="Open in new window"
              >
                <ExternalLink size={13} /> Open Original
              </a>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {document.remarks && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Admissions Note:</span>
                <span>{document.remarks}</span>
              </div>
            </div>
          )}

          {/* Document Preview */}
          {document.file_url ? (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 flex items-center justify-center min-h-[380px]">
              {isImage && (
                <img
                  src={document.file_url}
                  alt={document.name}
                  className="max-h-[520px] max-w-full object-contain mx-auto"
                />
              )}
              {isPdf && (
                <iframe
                  src={`${document.file_url}#toolbar=0`}
                  title={document.name}
                  className="w-full h-[520px] bg-white border-0"
                />
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <FileText size={48} className="opacity-25 mb-3" />
              <p className="font-bold text-slate-700 text-sm">No file uploaded yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Upload student certificate to view and verify.
              </p>
            </div>
          )}

          {/* Re-upload Remark input if clicked */}
          {showRejectInput && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="form-label">Reason for Requesting Re-upload</span>
              <input
                type="text"
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="e.g., Image is blurry, name mismatch, stamp missing..."
                className="input-field text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(false)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updating || !rejectRemarks.trim()}
                  onClick={() => handleUpdateStatus("PENDING", rejectRemarks)}
                  className="btn-primary text-xs py-1.5 px-4 bg-red-600 hover:bg-red-700"
                >
                  Confirm Request Re-upload
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#F8FAFD] border-t border-[var(--border)] flex items-center justify-between flex-shrink-0">
          <div>
            {document.uploaded_at && (
              <span className="text-[11px] text-[var(--text-sub)]">
                Uploaded: {new Date(document.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {document.file_url && document.status !== "VERIFIED" && !showRejectInput && (
              <button
                type="button"
                disabled={updating}
                onClick={() => setShowRejectInput(true)}
                className="btn-secondary text-xs text-red-600 hover:bg-red-50 border-red-200"
              >
                Request Re-upload
              </button>
            )}

            {document.file_url && document.status !== "VERIFIED" && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus("VERIFIED")}
                className="btn-primary text-xs bg-emerald-700 hover:bg-emerald-800"
              >
                {updating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} /> Verify & Approve
                  </>
                )}
              </button>
            )}

            {document.status === "VERIFIED" && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus("PENDING", "Verification revoked")}
                className="btn-secondary text-xs text-amber-700 hover:bg-amber-50"
              >
                Revoke Verification
              </button>
            )}

            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
