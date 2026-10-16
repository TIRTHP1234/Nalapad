"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import {
  FileText, CheckCircle2, Clock, AlertCircle, Loader2,
  ChevronRight, Search, Upload, Eye, Filter, RotateCw, Users
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import DocumentUploadModal from "@/components/DocumentUploadModal";
import DocumentViewerModal from "@/components/DocumentViewerModal";

interface DocumentItem {
  id: string;
  enquiry_id: string;
  name: string;
  status: "PENDING" | "SUBMITTED" | "VERIFIED";
  remarks: string | null;
  file_url: string | null;
  file_name?: string | null;
  uploaded_at: string | null;
  created_at: string;
  updated_at: string;
  enquiries: {
    id: string;
    enquiry_id: string;
    student_name: string;
    applying_class: string;
    academic_year: string;
    primary_contact: string;
    status: string;
  };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUBMITTED" | "PENDING" | "VERIFIED">("ALL");
  const [viewMode, setViewMode] = useState<"candidate" | "queue">("candidate");

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeUploadDoc, setActiveUploadDoc] = useState<{
    enquiryId: string;
    studentName: string;
    name: string;
    id?: string;
  } | null>(null);

  const [showViewerModal, setShowViewerModal] = useState(false);
  const [activeViewDoc, setActiveViewDoc] = useState<{
    doc: any;
    studentName: string;
  } | null>(null);

  async function loadDocuments() {
    try {
      setRefreshing(true);
      const res = await fetch("/api/documents");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setDocuments(json.data);
      }
    } catch (err) {
      console.error("Failed to load documents page data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  // Compute metrics
  const totalDocs = documents.length;
  const submittedCount = documents.filter((d) => d.status === "SUBMITTED").length;
  const pendingCount = documents.filter((d) => d.status === "PENDING").length;
  const verifiedCount = documents.filter((d) => d.status === "VERIFIED").length;

  // Filtered documents
  const filteredDocs = documents.filter((d) => {
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const studentMatch = d.enquiries?.student_name?.toLowerCase().includes(q);
      const idMatch = d.enquiries?.enquiry_id?.toLowerCase().includes(q);
      const docMatch = d.name.toLowerCase().includes(q);
      const classMatch = d.enquiries?.applying_class?.toLowerCase().includes(q);
      return studentMatch || idMatch || docMatch || classMatch;
    }
    return true;
  });

  // Group by candidate for Candidate Dossier view
  const candidateGroups = filteredDocs.reduce((acc, doc) => {
    const enqId = doc.enquiry_id;
    if (!acc[enqId]) {
      acc[enqId] = {
        enquiry: doc.enquiries,
        docs: [],
      };
    }
    acc[enqId].docs.push(doc);
    return acc;
  }, {} as Record<string, { enquiry: DocumentItem["enquiries"]; docs: DocumentItem[] }>);

  const candidateList = Object.values(candidateGroups);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Topbar
        title="Document Verification Desk"
        subtitle="Manage admission checklist verification and compliance across student candidates"
      />

      <div className="p-7 space-y-6 fade-in max-w-[1600px] mx-auto w-full">
        {/* ── METRICS SUMMARY BAR ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Documents
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalDocs}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across registered applicants</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--blue-700)] flex items-center justify-center">
              <FileText size={22} />
            </div>
          </div>

          <div
            className="card p-5 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-all"
            onClick={() => setStatusFilter("SUBMITTED")}
            style={{
              borderColor: statusFilter === "SUBMITTED" ? "var(--blue-700)" : undefined,
              boxShadow: statusFilter === "SUBMITTED" ? "0 0 0 2px rgba(26,86,219,0.15)" : undefined,
            }}
          >
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block flex items-center gap-1.5">
                Awaiting Review
              </span>
              <p className="text-2xl font-bold text-blue-700 mt-1">{submittedCount}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Needs staff review & approval</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Clock size={22} />
            </div>
          </div>

          <div
            className="card p-5 flex items-center justify-between cursor-pointer hover:border-slate-400 transition-all"
            onClick={() => setStatusFilter("PENDING")}
            style={{
              borderColor: statusFilter === "PENDING" ? "var(--blue-700)" : undefined,
              boxShadow: statusFilter === "PENDING" ? "0 0 0 2px rgba(26,86,219,0.15)" : undefined,
            }}
          >
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Pending Upload
              </span>
              <p className="text-2xl font-bold text-slate-700 mt-1">{pendingCount}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Awaiting parent submission</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <AlertCircle size={22} />
            </div>
          </div>

          <div
            className="card p-5 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all"
            onClick={() => setStatusFilter("VERIFIED")}
            style={{
              borderColor: statusFilter === "VERIFIED" ? "#10B981" : undefined,
              boxShadow: statusFilter === "VERIFIED" ? "0 0 0 2px rgba(16,185,129,0.15)" : undefined,
            }}
          >
            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                Verified & Approved
              </span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{verifiedCount}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Cleared for admission</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* ── TOOLBAR / CONTROLS ── */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate, enquiry ID, or document name..."
                className="input-field pl-10 text-xs h-10 w-full"
              />
            </div>

            <button
              onClick={loadDocuments}
              disabled={refreshing}
              className="btn-secondary text-xs h-10 px-3 flex items-center gap-1.5"
              title="Refresh list"
            >
              <RotateCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Filter Pills & View Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              {(
                [
                  { key: "ALL", label: `All (${totalDocs})` },
                  { key: "SUBMITTED", label: `Review (${submittedCount})` },
                  { key: "PENDING", label: `Pending (${pendingCount})` },
                  { key: "VERIFIED", label: `Verified (${verifiedCount})` },
                ] as const
              ).map((tab) => {
                const active = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    style={{
                      background: active ? "#FFFFFF" : "transparent",
                      color: active ? "var(--blue-700)" : "var(--text-sub)",
                      boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("candidate")}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                style={{
                  background: viewMode === "candidate" ? "#FFFFFF" : "transparent",
                  color: viewMode === "candidate" ? "var(--blue-700)" : "var(--text-sub)",
                  boxShadow: viewMode === "candidate" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                By Candidate
              </button>
              <button
                onClick={() => setViewMode("queue")}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                style={{
                  background: viewMode === "queue" ? "#FFFFFF" : "transparent",
                  color: viewMode === "queue" ? "var(--blue-700)" : "var(--text-sub)",
                  boxShadow: viewMode === "queue" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Queue List
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ color: "var(--text-sub)" }}>
            <Loader2 className="animate-spin mb-3" size={28} color="#1A56DB" />
            <p className="text-sm font-semibold">Loading verification checklists...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="card text-center py-18" style={{ color: "var(--text-muted)" }}>
            <FileText size={44} className="mx-auto mb-3 opacity-25" />
            <p className="text-base font-bold" style={{ color: "var(--text-h)" }}>
              No documents match your filter
            </p>
            <p className="text-xs mt-1 mb-5" style={{ color: "var(--text-sub)" }}>
              {statusFilter !== "ALL"
                ? `There are no documents currently in "${statusFilter}" status.`
                : "No candidates with registered documents found."}
            </p>
            <button onClick={() => { setStatusFilter("ALL"); setSearch(""); }} className="btn-secondary text-xs py-2 px-4">
              Clear All Filters
            </button>
          </div>
        ) : viewMode === "candidate" ? (
          /* ── VIEW 1: BY CANDIDATE DOSSIER ── */
          <div className="space-y-6">
            {candidateList.map(({ enquiry, docs }) => {
              if (!enquiry) return null;
              const enqVerified = docs.filter((d) => d.status === "VERIFIED").length;
              const enqSubmitted = docs.filter((d) => d.status === "SUBMITTED").length;
              const isAllVerified = enqVerified === docs.length && docs.length > 0;

              return (
                <div key={enquiry.id} className="card p-6">
                  {/* Candidate header strip */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-[var(--border)]">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link href={`/enquiries/${enquiry.id}`}>
                          <h3 className="text-base font-bold hover:underline text-slate-900">
                            {enquiry.student_name}
                          </h3>
                        </Link>
                        <span className="chip" style={{ background: "var(--blue-50)", color: "var(--blue-700)", borderColor: "#BFDBFE" }}>
                          {enquiry.applying_class}
                        </span>
                        {isAllVerified && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 size={12} /> All Verified
                          </span>
                        )}
                        {enqSubmitted > 0 && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Clock size={12} /> {enqSubmitted} Awaiting Review
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        ID: <span className="font-semibold text-slate-800">{enquiry.enquiry_id}</span> · AY {enquiry.academic_year} · Contact: {enquiry.primary_contact}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                        {enqVerified} / {docs.length} Verified
                      </span>
                      <Link
                        href={`/enquiries/${enquiry.id}`}
                        className="btn-secondary text-xs h-9 px-3 flex items-center gap-1.5"
                      >
                        Enquiry Profile <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* Documents grid for this candidate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {docs.map((doc) => {
                      const isV = doc.status === "VERIFIED";
                      const isS = doc.status === "SUBMITTED";
                      const isP = doc.status === "PENDING";
                      const hasFile = Boolean(doc.file_url);

                      return (
                        <div
                          key={doc.id}
                          className="p-3.5 rounded-xl border border-[var(--border)] bg-[#F8FAFD] flex flex-col justify-between transition-all hover:bg-white hover:border-slate-300"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-xs font-bold text-slate-900 leading-tight">
                                {doc.name}
                              </span>
                              {isV && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                                  Verified
                                </span>
                              )}
                              {isS && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                                  Review
                                </span>
                              )}
                              {isP && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0">
                                  Pending
                                </span>
                              )}
                            </div>

                            {doc.remarks && (
                              <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded mb-2 border border-amber-200">
                                {doc.remarks}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 mt-2">
                            {hasFile ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveViewDoc({ doc, studentName: enquiry.student_name });
                                    setShowViewerModal(true);
                                  }}
                                  className="text-xs font-bold text-[var(--blue-700)] hover:underline flex items-center gap-1"
                                >
                                  <Eye size={12} /> Verify
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveUploadDoc({
                                      enquiryId: enquiry.id,
                                      studentName: enquiry.student_name,
                                      name: doc.name,
                                      id: doc.id,
                                    });
                                    setShowUploadModal(true);
                                  }}
                                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                                  title="Replace document file"
                                >
                                  <Upload size={11} /> Replace
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveUploadDoc({
                                    enquiryId: enquiry.id,
                                    studentName: enquiry.student_name,
                                    name: doc.name,
                                    id: doc.id,
                                  });
                                  setShowUploadModal(true);
                                }}
                                className="w-full text-xs font-semibold text-center py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1"
                              >
                                <Upload size={12} /> Upload File
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── VIEW 2: AUDIT QUEUE LIST ── */
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[#F8FAFD] text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Student Candidate</th>
                    <th className="py-3.5 px-4">Document Name</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Updated / Uploaded</th>
                    <th className="py-3.5 px-4">Notes / Remarks</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredDocs.map((doc) => {
                    const isV = doc.status === "VERIFIED";
                    const isS = doc.status === "SUBMITTED";
                    const isP = doc.status === "PENDING";
                    const hasFile = Boolean(doc.file_url);

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link href={`/enquiries/${doc.enquiries?.id}`}>
                            <p className="font-bold text-slate-900 hover:underline">
                              {doc.enquiries?.student_name}
                            </p>
                          </Link>
                          <p className="text-[11px] text-slate-400">
                            {doc.enquiries?.enquiry_id} · {doc.enquiries?.applying_class}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {doc.name}
                        </td>
                        <td className="py-3.5 px-4">
                          {isV && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Verified
                            </span>
                          )}
                          {isS && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              Awaiting Review
                            </span>
                          )}
                          {isP && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              Pending Upload
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {doc.uploaded_at ? formatDate(doc.uploaded_at) : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {doc.remarks || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasFile ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveViewDoc({ doc, studentName: doc.enquiries?.student_name });
                                  setShowViewerModal(true);
                                }}
                                className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1"
                              >
                                <Eye size={12} /> Review
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveUploadDoc({
                                    enquiryId: doc.enquiries?.id,
                                    studentName: doc.enquiries?.student_name,
                                    name: doc.name,
                                    id: doc.id,
                                  });
                                  setShowUploadModal(true);
                                }}
                                className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                              >
                                <Upload size={12} /> Upload
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      <DocumentUploadModal
        isOpen={showUploadModal && !!activeUploadDoc}
        onClose={() => {
          setShowUploadModal(false);
          setActiveUploadDoc(null);
        }}
        enquiryId={activeUploadDoc?.enquiryId || ""}
        studentName={activeUploadDoc?.studentName}
        documentName={activeUploadDoc?.name || "Admission Document"}
        documentId={activeUploadDoc?.id}
        onSuccess={() => {
          setShowUploadModal(false);
          setActiveUploadDoc(null);
          loadDocuments();
        }}
      />

      <DocumentViewerModal
        isOpen={showViewerModal && !!activeViewDoc}
        onClose={() => {
          setShowViewerModal(false);
          setActiveViewDoc(null);
        }}
        document={activeViewDoc?.doc}
        studentName={activeViewDoc?.studentName}
        onStatusUpdated={() => {
          setShowViewerModal(false);
          setActiveViewDoc(null);
          loadDocuments();
        }}
      />
    </div>
  );
}
