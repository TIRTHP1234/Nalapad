"use client";
import { useState } from "react";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { mockEnquiries, leadSourceLabels, statusLabels, classes } from "@/lib/mock-data";
import { LeadStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Search, SlidersHorizontal, X, Phone, MessageCircle, ChevronRight, Users } from "lucide-react";
import Link from "next/link";

const PIPELINE_TABS: { key: LeadStatus | "ALL"; label: string; color: string }[] = [
  { key: "ALL",                  label: "All",              color: "#1A56DB" },
  { key: "NEW",                  label: "New",              color: "#0891B2" },
  { key: "FOLLOW_UP",            label: "Follow Up",        color: "#D97706" },
  { key: "WALK_IN_SCHEDULED",    label: "Walk-in Sched.",   color: "#7C3AED" },
  { key: "WALK_IN_DONE",         label: "Walk-in Done",     color: "#0F766E" },
  { key: "REGISTRATION_PAID",    label: "Registered",       color: "#047857" },
  { key: "ADMISSION_CONFIRMED",  label: "Admitted",         color: "#15803D" },
  { key: "DNP",                  label: "DNP",              color: "#6B7280" },
];

export default function EnquiriesPage() {
  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState<LeadStatus | "ALL">("ALL");
  const [sourceF, setSourceF]     = useState("ALL");
  const [classF, setClassF]       = useState("ALL");
  const [showFilters, setShow]    = useState(false);

  const filtered = mockEnquiries.filter(e => {
    const q = search.toLowerCase();
    const matchQ = !search ||
      e.studentName.toLowerCase().includes(q) ||
      e.enquiryId.toLowerCase().includes(q) ||
      e.primaryContact.includes(search) ||
      e.fatherName?.toLowerCase().includes(q) ||
      e.motherName?.toLowerCase().includes(q);
    const matchS = status === "ALL" || e.status === status;
    const matchSrc = sourceF === "ALL" || e.leadSource === sourceF;
    const matchCls = classF === "ALL" || e.applyingClass === classF;
    return matchQ && matchS && matchSrc && matchCls;
  });

  const summaryStats = [
    { label: "Total",      n: mockEnquiries.length,                                                                 color: "#1A56DB" },
    { label: "New",        n: mockEnquiries.filter(e => e.status === "NEW").length,                                 color: "#0891B2" },
    { label: "Follow Up",  n: mockEnquiries.filter(e => e.status === "FOLLOW_UP").length,                           color: "#D97706" },
    { label: "Walk-ins",   n: mockEnquiries.filter(e => ["WALK_IN_SCHEDULED","WALK_IN_DONE"].includes(e.status)).length, color: "#7C3AED" },
    { label: "Registered", n: mockEnquiries.filter(e => ["REGISTRATION_PENDING","REGISTRATION_PAID","ADMISSION_PENDING","ADMISSION_CONFIRMED"].includes(e.status)).length, color: "#047857" },
    { label: "DNP",        n: mockEnquiries.filter(e => e.status === "DNP").length,                                 color: "#6B7280" },
  ];

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <Topbar
        title="Enquiries"
        subtitle={`${filtered.length} of ${mockEnquiries.length} enquiries shown`}
        action={{ label: "New Enquiry", href: "/enquiries/new" }}
      />

      <div className="p-6 space-y-5 fade-in">

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {summaryStats.map(({ label, n, color }) => (
            <div key={label} className="card text-center" style={{ padding: "16px 12px", cursor: "pointer" }}
              onClick={() => setStatus(label === "Total" ? "ALL" : label === "Follow Up" ? "FOLLOW_UP" : label.toUpperCase().replace(" ", "_") as any)}>
              <p className="text-2xl font-bold mb-1" style={{ color, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{n}</p>
              <p className="text-xs font-600" style={{ color: "var(--text-sub)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Search + Filter bar ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative" style={{ flex: "1 1 260px", maxWidth: 400 }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by name, enquiry ID, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 38 }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} style={{ color: "var(--text-muted)" }} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShow(v => !v)}
            className="btn-secondary"
            style={{ position: "relative" }}
          >
            <SlidersHorizontal size={15} />
            Advanced Filters
            {(sourceF !== "ALL" || classF !== "ALL") && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                width: 18, height: 18, borderRadius: "50%",
                background: "var(--blue-700)", color: "#fff",
                fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>!</span>
            )}
          </button>
          {(search || status !== "ALL" || sourceF !== "ALL" || classF !== "ALL") && (
            <button className="btn-secondary" onClick={() => { setSearch(""); setStatus("ALL"); setSourceF("ALL"); setClassF("ALL"); }}>
              <X size={14} /> Clear All
            </button>
          )}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="card flex items-end gap-4 flex-wrap" style={{ padding: "18px 22px" }}>
            <div style={{ flex: "1 1 180px" }}>
              <label>Lead Source</label>
              <select className="input-field" value={sourceF} onChange={e => setSourceF(e.target.value)}>
                <option value="ALL">All Sources</option>
                {Object.entries(leadSourceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label>Class</label>
              <select className="input-field" value={classF} onChange={e => setClassF(e.target.value)}>
                <option value="ALL">All Classes</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="btn-secondary" onClick={() => { setSourceF("ALL"); setClassF("ALL"); }}>
              <X size={13} /> Reset
            </button>
          </div>
        )}

        {/* ── Status tabs ── */}
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          {/* Tab strip */}
          <div className="flex overflow-x-auto" style={{ borderBottom: "1px solid var(--border)", background: "#F8FAFC" }}>
            {PIPELINE_TABS.map(tab => {
              const count = tab.key === "ALL"
                ? mockEnquiries.length
                : mockEnquiries.filter(e => e.status === tab.key).length;
              const isActive = status === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatus(tab.key)}
                  style={{
                    padding: "12px 18px",
                    fontSize: 13.5,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? tab.color : "var(--text-sub)",
                    borderBottom: isActive ? `2.5px solid ${tab.color}` : "2.5px solid transparent",
                    background: "transparent",
                    border: "none",
                    borderBottomWidth: "2.5px",
                    borderBottomStyle: "solid",
                    borderBottomColor: isActive ? tab.color : "transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {tab.label}
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: "1px 7px", borderRadius: 20,
                    background: isActive ? `${tab.color}18` : "#EEF2F7",
                    color: isActive ? tab.color : "var(--text-muted)",
                  }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16"
              style={{ color: "var(--text-muted)" }}>
              <Users size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p className="text-base font-600" style={{ color: "var(--text-sub)" }}>No enquiries match your filters</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enquiry ID</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Contact</th>
                  <th>Source</th>
                  <th>Counsellor</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td>
                      <span className="font-700 text-sm" style={{ color: "var(--blue-700)", fontFamily: "monospace" }}>
                        {e.enquiryId}
                      </span>
                    </td>
                    <td>
                      <p className="font-700 text-sm" style={{ color: "var(--text-h)" }}>{e.studentName}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {e.fatherName || e.motherName || ""}
                      </p>
                      {e.hasSibling && (
                        <span className="chip mt-1" style={{ background: "#F5F3FF", color: "#7C3AED", borderColor: "#DDD6FE", fontSize: 10 }}>
                          Has Sibling
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="font-600 text-sm" style={{ color: "var(--text-body)" }}>{e.applyingClass}</span>
                    </td>
                    <td>
                      <a href={`tel:${e.primaryContact}`}
                        className="flex items-center gap-1.5 text-sm font-500 mb-1"
                        style={{ color: "var(--text-h)", textDecoration: "none" }}>
                        <Phone size={13} style={{ color: "var(--blue-700)" }} />
                        {e.primaryContact}
                      </a>
                      {e.whatsapp && (
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-sub)" }}>
                          <MessageCircle size={11} style={{ color: "#25D366" }} />
                          {e.whatsapp}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="chip" style={{ background: "var(--blue-50)", color: "var(--blue-700)", borderColor: "#BFDBFE", fontSize: 12 }}>
                        {e.leadSource.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      {e.counsellorName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 text-white flex-shrink-0"
                            style={{ background: "var(--blue-700)" }}>
                            {e.counsellorName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="text-sm font-500" style={{ color: "var(--text-body)" }}>
                            {e.counsellorName.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Unassigned</span>
                      )}
                    </td>
                    <td><StatusBadge status={e.status} /></td>
                    <td className="text-sm" style={{ color: "var(--text-sub)" }}>
                      {formatDate(e.enquiryDate)}
                    </td>
                    <td>
                      <Link href={`/enquiries/${e.id}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                        style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}>
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
