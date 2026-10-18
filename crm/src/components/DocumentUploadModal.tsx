"use client";
import { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryId: string;
  studentName?: string;
  documentName: string;
  documentId?: string;
  onSuccess: () => void;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  enquiryId,
  studentName,
  documentName,
  documentId,
  onSuccess,
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setError("");
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(f.type)) {
      setError("Please select a valid PDF, PNG, JPEG, or WEBP document.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("enquiryId", enquiryId);
      fd.append("documentName", documentName);
      if (documentId) {
        fd.append("documentId", documentId);
      }

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to upload document");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-slide-up">
        {/* Header */}
        <div className="px-7 py-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 font-heading">Upload Document</h3>
            <p className="text-xs text-slate-500 mt-1">
              {documentName} {studentName && `· ${studentName}`}
            </p>
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
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              dragOver
                ? "border-[var(--blue-700)] bg-[var(--blue-50)]"
                : file
                ? "border-emerald-300 bg-emerald-50/50"
                : "border-slate-300 bg-[#F8FAFD] hover:bg-slate-50 hover:border-slate-400"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 shadow-xs">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-xs font-bold text-slate-900 max-w-[280px] truncate">{file.name}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB · Click or drag to replace
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--blue-700)] flex items-center justify-center mb-2.5 shadow-xs">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-bold text-[var(--text-h)]">
                  Click to browse or drag file here
                </p>
                <p className="text-xs text-[var(--text-sub)] mt-1">
                  Supports PDF, PNG, JPG up to 10MB
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5 select-none">
            <span className="font-semibold text-slate-800 block text-xs">Admissions Compliance Note:</span>
            <p className="text-xs leading-relaxed text-slate-500">
              Uploaded certificates are stored securely in Nalapad Supabase Storage and logged with an audit trail for verification.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="btn-secondary px-5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="btn-primary px-6"
            >
              {uploading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Uploading to Supabase...
                </>
              ) : (
                <>
                  <Upload size={15} /> Upload & Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
