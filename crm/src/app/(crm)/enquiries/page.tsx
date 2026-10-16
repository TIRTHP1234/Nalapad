"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { leadSourceLabels, statusLabels, classes } from "@/lib/mock-data";
import { LeadStatus, Enquiry } from "@/lib/types";
import { formatDate, mapEnquiryFromDb } from "@/lib/utils";
import {
  Search, SlidersHorizontal, X, Phone, MessageCircle, ChevronRight,
  Users, Loader2, Plus, Sparkles, UserCheck
} from "lucide-react";
import Link from "next/link";

const PIPELINE_TABS: { key: LeadStatus | "ALL"; label: string; color: string }[] = [
  { key: "ALL",                  label: "All Leads",        color: "#1A56DB" },
  { key: "NEW",                  label: "New",              color: "#0891B2" },
  { key: "FOLLOW_UP",            label: "Follow Up",        color: "#D97706" },
  { key: "WALK_IN_SCHEDULED",    label: "Walk-in Sched.",   color: "#7C3AED" },
  { key: "WALK_IN_DONE",         label: "Visit Completed",  color: "#0F766E" },
  { key: "REGISTRATION_PAID",    label: "Registered",       color: "#047857" },
  { key: "ADMISSION_CONFIRMED",  label: "Admitted",         color: "#15803D" },
  { key: "DNP",                  label: "Did Not Proceed",  color: "#6B7280" },
];

import { useAuth } from "@/contexts/AuthContext";

export default function EnquiriesPage() {
  const { user, isCounsellor } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState<LeadStatus | "ALL">("ALL");
  const [sourceF, setSourceF]     = useState("ALL");
  const [classF, setClassF]       = useState("ALL");
  const [counsellorF, setCounsellorF] = useState("ALL");
  const [myLeadsOnly, setMyLeadsOnly] = useState(false);
  const [counsellorsList, setCounsellorsList] = useState<any[]>([]);
  const [showFilters, setShow]    = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [enqRes, counsRes] = await Promise.all([
          fetch("/api/enquiries"),
          fetch("/api/counsellors"),
        ]);
        const enqJson = await enqRes.json();
        const counsJson = await counsRes.json();
        if (enqJson.data && Array.isArray(enqJson.data)) {
          setEnquiries(enqJson.data.map(mapEnquiryFromDb));
        }
        if (counsJson.data && Array.isArray(counsJson.data)) {
          setCounsellorsList(counsJson.data);
        }
      } catch (e) {
        console.error("Live fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = enquiries.filter(e => {
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
    const matchCouns = myLeadsOnly && user
      ? (e.counsellorId === user.id || (e.counsellorName && user.fullName && e.counsellorName.toLowerCase().includes(user.fullName.toLowerCase())))
      : counsellorF === "ALL" || e.counsellorId === counsellorF || e.counsellorName === counsellorF;
    return matchQ && matchS && matchSrc && matchCls && matchCouns;
  });

  const summaryStats = [
    { label: "Total Leads",  key: "ALL",                  n: enquiries.length,                                                                 color: "#1A56DB", bg: "#EBF2FF" },
    { label: "New",          key: "NEW",                  n: enquiries.filter(e => e.status === "NEW").length,                                 color: "#0891B2", bg: "#ECFEFF" },
    { label: "Follow Up",    key: "FOLLOW_UP",            n: enquiries.filter(e => e.status === "FOLLOW_UP").length,                           color: "#D97706", bg: "#FFFBEB" },
    { label: "Walk-ins",     key: "WALK_IN_SCHEDULED",    n: enquiries.filter(e => ["WALK_IN_SCHEDULED","WALK_IN_DONE"].includes(e.status)).length, color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Registered",   key: "REGISTRATION_PAID",    n: enquiries.filter(e => ["REGISTRATION_PENDING","REGISTRATION_PAID","ADMISSION_PENDING","ADMISSION_CONFIRMED"].includes(e.status)).length, color: "#047857", bg: "#ECFDF5" },
    { label: "DNP",          key: "DNP",                  n: enquiries.filter(e => e.status === "DNP").length,                                 color: "#6B7280", bg: "#F3F4F6" },
  ];

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <Topbar
        title="Admission Enquiries"
        subtitle={`${filtered.length} of ${enquiries.length} prospective students shown`}
        action={{ label: "New Enquiry", href: "/enquiries/new" }}
      />

      <div className="p-7 space-y-6 fade-in max-w-[1600px] mx-auto w-full">

        {/* ── SUMMARY STAT CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {summaryStats.map(({ label, key, n, color, bg }) => {
            const isSelected = status === key;
            return (
              <div
                key={label}
                className="card p-4 text-center cursor-pointer transition-all hover:translate-y-[-1px]"
                style={{
                  border: isSelected ? `2px solid ${color}` : "1px solid var(--border)",
                  background: isSelected ? bg : "#FFFFFF",
                }}
                onClick={() => setStatus(key as any)}
              >
                <p className="text-2xl font-extrabold mb-1" style={{ color, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {n}
                </p>
                <p className="text-xs font-bold" style={{ color: "var(--text-sub)" }}>{label}</p>
              </div>
            );
          })}
        </div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by student name, ID, mobile, parent..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 text-xs"
              style={{ height: "40px" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShow(v => !v)}
            className="btn-secondary"
            style={{ position: "relative", minHeight: "40px", padding: "8px 16px" }}
          >
            <SlidersHorizontal size={15} />
            Filters
            {(sourceF !== "ALL" || classF !== "ALL" || counsellorF !== "ALL" || myLeadsOnly) && (
              <span className="w-2 h-2 rounded-full bg-blue-600 ml-1" />
            )}
          </button>

          {isCounsellor && (
            <button
              type="button"
              onClick={() => setMyLeadsOnly(v => !v)}
              className="btn-secondary text-xs"
              style={{
                minHeight: "40px",
                padding: "8px 14px",
                background: myLeadsOnly ? "var(--blue-50)" : undefined,
                color: myLeadsOnly ? "var(--blue-700)" : undefined,
                borderColor: myLeadsOnly ? "var(--blue-700)" : undefined,
              }}
            >
              <UserCheck size={14} /> {myLeadsOnly ? "Showing My Assigned Leads" : "My Leads Only"}
            </button>
          )}

          {(search || status !== "ALL" || sourceF !== "ALL" || classF !== "ALL" || counsellorF !== "ALL" || myLeadsOnly) && (
            <button
              className="btn-secondary text-xs"
              style={{ minHeight: "40px", color: "var(--text-sub)" }}
              onClick={() => { setSearch(""); setStatus("ALL"); setSourceF("ALL"); setClassF("ALL"); setCounsellorF("ALL"); setMyLeadsOnly(false); }}
            >
              <X size={14} /> Reset Filters
            </button>
          )}
        </div>

        {/* ── ADVANCED FILTERS PANEL ── */}
        {showFilters && (
          <div className="card p-5 bg-[#F8FAFD] flex items-end gap-5 flex-wrap border border-[var(--border)]">
            <div className="flex-1 min-w-[200px]">
              <span className="form-label">Filter by Lead Source</span>
              <select className="input-field" value={sourceF} onChange={e => setSourceF(e.target.value)}>
                <option value="ALL">All Source Channels</option>
                {Object.entries(leadSourceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <span className="form-label">Filter by Target Class</span>
              <select className="input-field" value={classF} onChange={e => setClassF(e.target.value)}>
                <option value="ALL">All Classes / Grades</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <span className="form-label">Filter by Counsellor</span>
              <select className="input-field" value={counsellorF} onChange={e => setCounsellorF(e.target.value)}>
                <option value="ALL">All Counsellors</option>
                {counsellorsList.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>
            <button
              className="btn-secondary text-xs"
              style={{ minHeight: "42px" }}
              onClick={() => { setSourceF("ALL"); setClassF("ALL"); setCounsellorF("ALL"); setMyLeadsOnly(false); }}
            >
              Reset Selectors
            </button>
          </div>
        )}

        {/* ── STAGE TABS & DATA TABLE ── */}
        <div className="card p-0 overflow-hidden">
          {/* Tab Strip */}
          <div className="flex overflow-x-auto border-b border-[var(--border)] bg-[#F8FAFD] px-2">
            {PIPELINE_TABS.map(tab => {
              const count = tab.key === "ALL"
                ? enquiries.length
                : enquiries.filter(e => e.status === tab.key).length;
              const isActive = status === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatus(tab.key)}
                  className="flex items-center gap-2 py-3.5 px-4.5 text-xs font-bold transition-all border-b-2 cursor-pointer focus:outline-none flex-shrink-0"
                  style={{
                    color: isActive ? tab.color : "var(--text-sub)",
                    borderColor: isActive ? tab.color : "transparent",
                    background: "transparent",
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-extrabold"
                    style={{
                      background: isActive ? `${tab.color}18` : "#EEF2F7",
                      color: isActive ? tab.color : "var(--text-muted)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table or Empty State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20" style={{ color: "var(--text-sub)" }}>
              <Loader2 className="animate-spin mb-3" size={28} color="#1A56DB" />
              <p className="text-sm font-semibold">Loading enquiries database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-18 text-center" style={{ color: "var(--text-muted)" }}>
              <Users size={40} style={{ opacity: 0.25, marginBottom: 12 }} />
              <p className="text-base font-bold" style={{ color: "var(--text-h)" }}>
                {enquiries.length === 0 ? "No enquiries recorded yet" : "No enquiries match your search criteria"}
              </p>
              <p className="text-xs mt-1 mb-5" style={{ color: "var(--text-sub)" }}>
                {enquiries.length === 0 ? "Begin registering prospective candidates into the admissions pipeline." : "Try clearing filters or adjusting your search keywords."}
              </p>
              {enquiries.length === 0 && (
                <Link href="/enquiries/new" className="btn-primary text-xs py-2 px-4">
                  <Plus size={14} /> Create First Enquiry
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Enquiry ID</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Contact Info</th>
                    <th>Lead Source</th>
                    <th>Counsellor</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id}>
                      <td>
                        <span className="font-bold text-xs" style={{ color: "var(--blue-700)", fontFamily: "monospace" }}>
                          {e.enquiryId}
                        </span>
                      </td>
                      <td>
                        <Link href={`/enquiries/${e.id}`}>
                          <p className="font-bold text-sm hover:underline" style={{ color: "var(--text-h)" }}>{e.studentName}</p>
                          <p className="text-xs mt-0.5 font-500" style={{ color: "var(--text-muted)" }}>
                            {e.fatherName || e.motherName || "Parent Contact"}
                          </p>
                          {e.hasSibling && (
                            <span className="chip mt-1" style={{ background: "#F5F3FF", color: "#7C3AED", borderColor: "#DDD6FE", fontSize: 10 }}>
                              Sibling
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="text-sm font-semibold">{e.applyingClass}</td>
                      <td>
                        <a href={`tel:${e.primaryContact}`}
                          className="flex items-center gap-1.5 text-xs font-bold mb-1 hover:underline"
                          style={{ color: "var(--text-h)", textDecoration: "none" }}>
                          <Phone size={12} style={{ color: "var(--blue-700)" }} />
                          {e.primaryContact}
                        </a>
                        {e.whatsapp && (
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#16A34A" }}>
                            <MessageCircle size={11} />
                            {e.whatsapp}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="chip" style={{ background: "var(--blue-50)", color: "var(--blue-700)", borderColor: "#BFDBFE" }}>
                          {e.leadSource.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        {e.counsellorName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                              style={{ background: "var(--blue-700)" }}>
                              {e.counsellorName.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="text-xs font-semibold" style={{ color: "var(--text-body)" }}>
                              {e.counsellorName.split(" ")[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Unassigned</span>
                        )}
                      </td>
                      <td><StatusBadge status={e.status} /></td>
                      <td className="text-xs font-500" style={{ color: "var(--text-sub)" }}>
                        {formatDate(e.enquiryDate)}
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/enquiries/${e.id}`}
                          className="btn-secondary text-xs inline-flex"
                          style={{ padding: "6px 12px", minHeight: "32px" }}
                        >
                          View <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
