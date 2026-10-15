"use client";
import Topbar from "@/components/Topbar";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { mockEnquiries } from "@/lib/mock-data";

const admittedEnquiries = mockEnquiries.filter(e =>
  ["REGISTRATION_PAID", "ADMISSION_PENDING", "ADMISSION_CONFIRMED"].includes(e.status)
);

const requiredDocs = [
  "Birth Certificate", "Previous School TC", "Report Card / Mark Sheet",
  "Passport-size Photos (4)", "Aadhaar Card – Student", "Aadhaar Card – Parent",
  "Address Proof", "Caste Certificate (if applicable)",
];

const mockDocStatus = (enquiryId: string, doc: string): "PENDING" | "SUBMITTED" | "VERIFIED" => {
  const seed = enquiryId.charCodeAt(0) + doc.charCodeAt(0);
  if (seed % 3 === 0) return "VERIFIED";
  if (seed % 3 === 1) return "SUBMITTED";
  return "PENDING";
};

const statusConf = {
  PENDING: { color: "#ef4444", icon: <AlertCircle size={12} />, label: "Pending" },
  SUBMITTED: { color: "#f59e0b", icon: <Clock size={12} />, label: "Submitted" },
  VERIFIED: { color: "#10b981", icon: <CheckCircle2 size={12} />, label: "Verified" },
};

export default function DocumentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Documents" subtitle="Track admission document status" />
      <div className="flex-1 p-6 space-y-4 fade-in">
        {admittedEnquiries.length === 0 ? (
          <div className="card text-center py-16" style={{ color: "var(--text-muted)" }}>
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>No students in document collection stage.</p>
          </div>
        ) : (
          admittedEnquiries.map((e) => (
            <div key={e.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p className="text-sm font-semibold text-white">{e.studentName}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {e.applyingClass} · {e.enquiryId}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  {(["PENDING", "SUBMITTED", "VERIFIED"] as const).map(s => {
                    const count = requiredDocs.filter(d => mockDocStatus(e.id, d) === s).length;
                    const c = statusConf[s];
                    return (
                      <span key={s} className="flex items-center gap-1 px-2 py-1 rounded-lg font-semibold"
                        style={{ background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30` }}>
                        {c.icon}{count} {s}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                {requiredDocs.map((doc, i) => {
                  const s = mockDocStatus(e.id, doc);
                  const c = statusConf[s];
                  return (
                    <div key={doc} className="px-4 py-3 flex items-center justify-between gap-2"
                      style={{ borderRight: i % 4 !== 3 ? "1px solid var(--border)" : "none", borderBottom: i < requiredDocs.length - 4 ? "1px solid var(--border)" : "none" }}>
                      <span className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>{doc}</span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold flex-shrink-0"
                        style={{ color: c.color }}>{c.icon}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
