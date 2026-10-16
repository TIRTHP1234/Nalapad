"use client";
import { useState, useEffect, Suspense } from "react";
import Topbar from "@/components/Topbar";
import { leadSourceLabels, statusLabels } from "@/lib/mock-data";
import { mapEnquiryFromDb, formatDate } from "@/lib/utils";
import { Enquiry } from "@/lib/types";
import {
  Download, BarChart3, Users, Loader2, Calendar, IndianRupee,
  TrendingUp, CheckCircle2, Clock, Filter, ArrowRight, FileText,
  Layers, CreditCard, RotateCw, ChevronRight
} from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const COLORS = ["#1A56DB", "#0891B2", "#059669", "#D97706", "#7C3AED", "#DC2626", "#0D9488", "#EA580C"];

type DateFilter = "ALL" | "THIS_MONTH" | "THIS_WEEK" | "AY_25_26";

function ReportsContent() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [walkins, setWalkins] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [activeTab, setActiveTab] = useState<"funnel" | "sources" | "counsellors" | "revenue" | "classes">("funnel");
  const [showExportModal, setShowExportModal] = useState(false);
  const [clientDate, setClientDate] = useState<Date | null>(null);

  useEffect(() => {
    setClientDate(new Date());
  }, []);

  async function loadAllData() {
    try {
      setRefreshing(true);
      const [enqRes, feeRes, walkRes, docRes] = await Promise.all([
        fetch("/api/enquiries"),
        fetch("/api/fees"),
        fetch("/api/walkins"),
        fetch("/api/documents"),
      ]);

      const [enqJson, feeJson, walkJson, docJson] = await Promise.all([
        enqRes.json(),
        feeRes.json(),
        walkRes.json(),
        docRes.json(),
      ]);

      if (enqJson.data && Array.isArray(enqJson.data)) {
        setEnquiries(enqJson.data.map(mapEnquiryFromDb));
      }
      if (feeJson.data && Array.isArray(feeJson.data)) {
        setFees(feeJson.data);
      }
      if (walkJson.data && Array.isArray(walkJson.data)) {
        setWalkins(walkJson.data);
      }
      if (docJson.data && Array.isArray(docJson.data)) {
        setDocuments(docJson.data);
      }
    } catch (err) {
      console.error("Failed to load reports datasets:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter helper based on date (only computed once clientDate is set)
  const now = clientDate;
  const startOfMonth = now ? new Date(now.getFullYear(), now.getMonth(), 1) : null;
  const startOfWeek = now ? new Date(now) : null;
  if (startOfWeek && now) {
    startOfWeek.setDate(now.getDate() - now.getDay());
  }

  const filteredEnquiries = enquiries.filter((e) => {
    if (dateFilter === "ALL" || !now) return true;
    if (dateFilter === "AY_25_26") return e.academicYear === "2025-26";
    const d = new Date(e.enquiryDate || e.createdAt || now);
    if (dateFilter === "THIS_MONTH" && startOfMonth) return d >= startOfMonth;
    if (dateFilter === "THIS_WEEK" && startOfWeek) return d >= startOfWeek;
    return true;
  });

  const filteredFees = fees.filter((f) => {
    if (dateFilter === "ALL" || !now) return true;
    const d = new Date(f.payment_date || now);
    if (dateFilter === "THIS_MONTH" && startOfMonth) return d >= startOfMonth;
    if (dateFilter === "THIS_WEEK" && startOfWeek) return d >= startOfWeek;
    return true;
  });

  const filteredWalkins = walkins.filter((w) => {
    if (dateFilter === "ALL" || !now) return true;
    const d = new Date(w.visit_date || now);
    if (dateFilter === "THIS_MONTH" && startOfMonth) return d >= startOfMonth;
    if (dateFilter === "THIS_WEEK" && startOfWeek) return d >= startOfWeek;
    return true;
  });

  // KPI Calculations
  const totalEnquiries = filteredEnquiries.length;
  const totalWalkins = filteredWalkins.length;
  const confirmedAdmissions = filteredEnquiries.filter((e) => e.status === "ADMISSION_CONFIRMED").length;
  const overallConversionRate = totalEnquiries > 0 ? ((confirmedAdmissions / totalEnquiries) * 100).toFixed(1) : "0.0";
  const totalRevenue = filteredFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  // Funnel Pipeline Steps
  const funnelSteps = [
    {
      id: "inquiry",
      label: "Enquiries Ingested",
      desc: "Initial student leads received across all channels",
      count: totalEnquiries,
      color: "#1A56DB",
      pct: 100,
    },
    {
      id: "contacted",
      label: "Contacted / Follow-up",
      desc: "Parent connected & counselling initiated",
      count: filteredEnquiries.filter((e) =>
        ["FOLLOW_UP", "WALK_IN_SCHEDULED", "WALK_IN_DONE", "REGISTRATION_PENDING", "REGISTRATION_PAID", "ADMISSION_PENDING", "ADMISSION_CONFIRMED"].includes(e.status)
      ).length,
      color: "#0891B2",
      pct: totalEnquiries > 0
        ? Math.round((filteredEnquiries.filter((e) => ["FOLLOW_UP", "WALK_IN_SCHEDULED", "WALK_IN_DONE", "REGISTRATION_PENDING", "REGISTRATION_PAID", "ADMISSION_PENDING", "ADMISSION_CONFIRMED"].includes(e.status)).length / totalEnquiries) * 100)
        : 0,
    },
    {
      id: "walkin",
      label: "Campus Walk-ins",
      desc: "In-person campus tours & assessments completed",
      count: filteredEnquiries.filter((e) =>
        ["WALK_IN_DONE", "REGISTRATION_PENDING", "REGISTRATION_PAID", "ADMISSION_PENDING", "ADMISSION_CONFIRMED"].includes(e.status)
      ).length,
      color: "#D97706",
      pct: totalEnquiries > 0
        ? Math.round((filteredEnquiries.filter((e) => ["WALK_IN_DONE", "REGISTRATION_PENDING", "REGISTRATION_PAID", "ADMISSION_PENDING", "ADMISSION_CONFIRMED"].includes(e.status)).length / totalEnquiries) * 100)
        : 0,
    },
    {
      id: "registered",
      label: "Registration Paid",
      desc: "Formal application fee paid & seat held",
      count: filteredEnquiries.filter((e) =>
        ["REGISTRATION_PAID", "ADMISSION_PENDING", "ADMISSION_CONFIRMED"].includes(e.status)
      ).length,
      color: "#059669",
      pct: totalEnquiries > 0
        ? Math.round((filteredEnquiries.filter((e) => ["REGISTRATION_PAID", "ADMISSION_PENDING", "ADMISSION_CONFIRMED"].includes(e.status)).length / totalEnquiries) * 100)
        : 0,
    },
    {
      id: "confirmed",
      label: "Admission Confirmed",
      desc: "Tuition paid, documents verified & enrolled",
      count: confirmedAdmissions,
      color: "#047857",
      pct: totalEnquiries > 0 ? Math.round((confirmedAdmissions / totalEnquiries) * 100) : 0,
    },
  ];

  // Lead Source Performance Matrix
  const sourceStatsMap: Record<string, { total: number; confirmed: number; revenue: number }> = {};
  filteredEnquiries.forEach((e) => {
    const src = e.leadSource || "OTHER";
    if (!sourceStatsMap[src]) {
      sourceStatsMap[src] = { total: 0, confirmed: 0, revenue: 0 };
    }
    sourceStatsMap[src].total += 1;
    if (e.status === "ADMISSION_CONFIRMED") {
      sourceStatsMap[src].confirmed += 1;
    }
  });

  filteredFees.forEach((f) => {
    const enq = filteredEnquiries.find((e) => e.id === f.enquiry_id || e.enquiryId === f.enquiry_id);
    const src = enq?.leadSource || "OTHER";
    if (!sourceStatsMap[src]) {
      sourceStatsMap[src] = { total: 0, confirmed: 0, revenue: 0 };
    }
    sourceStatsMap[src].revenue += Number(f.amount) || 0;
  });

  const sourceMatrix = Object.entries(sourceStatsMap).map(([srcKey, data]) => {
    const label = leadSourceLabels[srcKey] || srcKey.replace(/_/g, " ");
    const conv = data.total > 0 ? ((data.confirmed / data.total) * 100).toFixed(1) : "0.0";
    return {
      key: srcKey,
      label,
      total: data.total,
      confirmed: data.confirmed,
      convRate: conv,
      revenue: data.revenue,
    };
  }).sort((a, b) => b.total - a.total);

  // Counsellor Performance Matrix
  const counsellorMap: Record<string, { name: string; total: number; walkins: number; confirmed: number; revenue: number }> = {};
  filteredEnquiries.forEach((e) => {
    const cName = e.counsellorName || "Unassigned";
    if (!counsellorMap[cName]) {
      counsellorMap[cName] = { name: cName, total: 0, walkins: 0, confirmed: 0, revenue: 0 };
    }
    counsellorMap[cName].total += 1;
    if (["WALK_IN_SCHEDULED", "WALK_IN_DONE"].includes(e.status)) counsellorMap[cName].walkins += 1;
    if (e.status === "ADMISSION_CONFIRMED") counsellorMap[cName].confirmed += 1;
  });

  filteredFees.forEach((f) => {
    const enq = filteredEnquiries.find((e) => e.id === f.enquiry_id || e.enquiryId === f.enquiry_id);
    const cName = enq?.counsellorName || "Unassigned";
    if (!counsellorMap[cName]) {
      counsellorMap[cName] = { name: cName, total: 0, walkins: 0, confirmed: 0, revenue: 0 };
    }
    counsellorMap[cName].revenue += Number(f.amount) || 0;
  });

  const counsellorMatrix = Object.values(counsellorMap).map((c) => ({
    ...c,
    convRate: c.total > 0 ? ((c.confirmed / c.total) * 100).toFixed(1) : "0.0",
  })).sort((a, b) => b.confirmed - a.confirmed);

  // Class / Grade Breakdown
  const classCounts: Record<string, number> = {};
  filteredEnquiries.forEach((e) => {
    const cls = e.applyingClass || "Unspecified";
    classCounts[cls] = (classCounts[cls] || 0) + 1;
  });
  const classReport = Object.entries(classCounts).map(([cls, count]) => ({
    class: cls,
    count,
  })).sort((a, b) => b.count - a.count);

  // Revenue Breakdown by Fee Type & Payment Mode
  const regFeeTotal = filteredFees.filter((f) => f.fee_type === "REGISTRATION").reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const admFeeTotal = filteredFees.filter((f) => f.fee_type === "ADMISSION").reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

  const paymentModesMap: Record<string, number> = {};
  filteredFees.forEach((f) => {
    const mode = f.payment_mode || "OTHER";
    paymentModesMap[mode] = (paymentModesMap[mode] || 0) + (Number(f.amount) || 0);
  });
  const paymentModeList = Object.entries(paymentModesMap).map(([mode, amt]) => ({
    mode,
    amount: amt,
    pct: totalRevenue > 0 ? Math.round((amt / totalRevenue) * 100) : 0,
  }));

  // CSV Export Engine
  const exportToCSV = (type: "enquiries" | "fees" | "walkins" | "documents") => {
    const dateStamp = new Date().toISOString().split("T")[0];

    const escapeCell = (cell: any) => {
      const str = String(cell ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let filename = "";
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (type === "enquiries") {
      filename = `nalapad_enquiries_master_${dateStamp}.csv`;
      headers = [
        "Enquiry ID", "Student Name", "Applying Class", "Academic Year",
        "Gender", "Date of Birth", "Father Name", "Primary Contact",
        "WhatsApp", "Email", "Lead Source", "Campaign", "Status",
        "Counsellor", "Enquiry Date"
      ];
      rows = filteredEnquiries.map((e) => [
        e.enquiryId,
        e.studentName,
        e.applyingClass,
        e.academicYear,
        e.studentGender || "",
        e.studentDOB ? formatDate(e.studentDOB) : "",
        e.fatherName || "",
        e.primaryContact,
        e.whatsapp || "",
        e.email || "",
        leadSourceLabels[e.leadSource] || e.leadSource,
        e.campaign || "",
        statusLabels[e.status] || e.status,
        e.counsellorName || "Unassigned",
        formatDate(e.enquiryDate)
      ]);
    } else if (type === "fees") {
      filename = `nalapad_fee_ledger_${dateStamp}.csv`;
      headers = [
        "Receipt Number", "Student Name", "Enquiry ID", "Class",
        "Fee Type", "Amount (INR)", "Payment Mode", "Reference Number", "Payment Date"
      ];
      rows = filteredFees.map((f) => [
        f.receipt_number || "—",
        f.enquiry?.student_name || "—",
        f.enquiry?.enquiry_id || "—",
        f.enquiry?.applying_class || "—",
        f.fee_type,
        f.amount,
        f.payment_mode || "—",
        f.transaction_reference || "—",
        formatDate(f.payment_date)
      ]);
    } else if (type === "walkins") {
      filename = `nalapad_campus_walkins_${dateStamp}.csv`;
      headers = [
        "Student Name", "Enquiry ID", "Class", "Visitor Name",
        "Visit Date", "Counsellor / Host", "Outcome", "Remarks"
      ];
      rows = filteredWalkins.map((w) => [
        w.enquiry?.student_name || "—",
        w.enquiry?.enquiry_id || "—",
        w.enquiry?.applying_class || "—",
        w.visitor_name,
        formatDate(w.visit_date),
        w.counsellor?.full_name || "Staff",
        w.outcome || "Scheduled",
        w.remarks || ""
      ]);
    } else if (type === "documents") {
      filename = `nalapad_document_compliance_${dateStamp}.csv`;
      headers = [
        "Student Name", "Enquiry ID", "Class", "Document Title",
        "Status", "File Attached", "Remarks", "Last Updated"
      ];
      rows = documents.map((d) => [
        d.enquiries?.student_name || "—",
        d.enquiries?.enquiry_id || "—",
        d.enquiries?.applying_class || "—",
        d.name,
        d.status,
        d.file_url ? "Yes" : "No",
        d.remarks || "",
        formatDate(d.updated_at || d.created_at)
      ]);
    }

    const csvContent = [
      headers.map(escapeCell).join(","),
      ...rows.map((row) => row.map(escapeCell).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Topbar
        title="Reports & Admissions Intelligence"
        subtitle="Executive performance metrics, conversion funnels, revenue analysis, and compliance exports"
      />

      <div className="p-7 space-y-7 fade-in max-w-[1600px] mx-auto w-full">
        {/* ── DATE FILTER & EXPORT TOOLBAR ── */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Filter size={13} /> Time Window:
            </span>
            {(
              [
                { key: "ALL", label: "All Time" },
                { key: "THIS_MONTH", label: "This Month" },
                { key: "THIS_WEEK", label: "This Week" },
                { key: "AY_25_26", label: "AY 2025-26" },
              ] as const
            ).map((f) => {
              const active = dateFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setDateFilter(f.key)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer border"
                  style={{
                    background: active ? "var(--blue-50)" : "#FFFFFF",
                    borderColor: active ? "var(--blue-700)" : "var(--border)",
                    color: active ? "var(--blue-700)" : "var(--text-sub)",
                  }}
                >
                  {f.label}
                </button>
              );
            })}

            <button
              onClick={loadAllData}
              disabled={refreshing}
              className="btn-secondary text-xs h-8 px-2.5 ml-2 flex items-center gap-1"
              title="Refresh Analytics"
            >
              <RotateCw size={13} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-sm"
            >
              <Download size={14} /> Export Datasets (CSV)
            </button>
          </div>
        </div>

        {/* ── TOP KPI SCORECARD ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enquiries</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[var(--blue-700)] flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{totalEnquiries}</p>
            <p className="text-[11px] text-slate-400 mt-1">Applicant student pool</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campus Walk-ins</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-2">{totalWalkins}</p>
            <p className="text-[11px] text-slate-400 mt-1">Guided campus visits</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmed Admissions</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-2">{confirmedAdmissions}</p>
            <p className="text-[11px] text-slate-400 mt-1">Finalized enrollments</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversion Rate</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-700 mt-2">{overallConversionRate}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Inquiry to enrolled</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collections</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <IndianRupee size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-800 mt-2">₹{totalRevenue.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-slate-400 mt-1">Registration & tuition revenue</p>
          </div>
        </div>

        {/* ── SECTION NAVIGATION TABS ── */}
        <div className="flex border-b border-[var(--border)] gap-6 text-sm font-bold">
          {(
            [
              { key: "funnel", label: "Admissions Funnel", icon: Layers },
              { key: "sources", label: "Marketing & Lead Sources", icon: BarChart3 },
              { key: "counsellors", label: "Counsellor Scorecard", icon: Users },
              { key: "revenue", label: "Financial Ledger", icon: CreditCard },
              { key: "classes", label: "Grade Demand", icon: FileText },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="flex items-center gap-2 pb-3 transition-all border-b-2 cursor-pointer focus:outline-none"
                style={{
                  color: active ? "var(--blue-700)" : "var(--text-sub)",
                  borderColor: active ? "var(--blue-700)" : "transparent",
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24" style={{ color: "var(--text-sub)" }}>
            <Loader2 className="animate-spin mb-3" size={32} color="#1A56DB" />
            <p className="text-base font-semibold">Generating admissions intelligence report...</p>
          </div>
        ) : (
          <>
            {/* 1. ADMISSIONS FUNNEL TAB */}
            {activeTab === "funnel" && (
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-900">End-to-End Admissions Conversion Funnel</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visualizing student candidate flow from initial inquiry ingestion to final confirmed enrollment.
                    </p>
                  </div>

                  {totalEnquiries === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <Layers size={36} className="mx-auto mb-2 opacity-30" />
                      <p className="font-semibold text-slate-700">No applicants in current time window</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {funnelSteps.map((step, idx) => {
                        const prevStep = idx > 0 ? funnelSteps[idx - 1] : null;
                        const dropOffPct = prevStep && prevStep.count > 0
                          ? Math.round(((prevStep.count - step.count) / prevStep.count) * 100)
                          : 0;

                        return (
                          <div key={step.id} className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFD]">
                            <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center flex-shrink-0"
                                  style={{ background: step.color }}
                                >
                                  {idx + 1}
                                </div>
                                <div>
                                  <span className="font-bold text-sm text-slate-900">{step.label}</span>
                                  <p className="text-[11px] text-slate-500">{step.desc}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                {idx > 0 && (
                                  <span className="text-[11px] text-slate-400">
                                    Drop-off: <strong className="text-red-600">{dropOffPct}%</strong>
                                  </span>
                                )}
                                <div className="text-right">
                                  <span className="text-base font-bold text-slate-900">{step.count}</span>
                                  <span className="text-xs text-slate-500 ml-1.5">({step.pct}% of pool)</span>
                                </div>
                              </div>
                            </div>

                            <div className="w-full h-3 rounded-full bg-slate-200/70 overflow-hidden mt-2">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${step.pct}%`, background: step.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. MARKETING & LEAD SOURCES TAB */}
            {activeTab === "sources" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="card p-6 xl:col-span-1">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Source Volume Distribution</h4>
                    <p className="text-xs text-slate-500 mb-4">Total lead count generated per acquisition channel</p>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sourceMatrix} layout="vertical" barSize={14}>
                          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                          <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fill: "#64748B" }} width={90} />
                          <Tooltip />
                          <Bar dataKey="total" name="Enquiries" radius={[0, 4, 4, 0]}>
                            {sourceMatrix.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card p-0 xl:col-span-2 overflow-hidden">
                    <div className="p-5 border-b border-slate-200">
                      <h4 className="text-sm font-bold text-slate-900">Lead Source Conversion & ROI Matrix</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Performance breakdown showing which acquisition sources deliver the highest admission conversion.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                            <th className="py-3 px-4">Lead Source</th>
                            <th className="py-3 px-4 text-center">Enquiries</th>
                            <th className="py-3 px-4 text-center">Confirmed</th>
                            <th className="py-3 px-4 text-center">Conversion %</th>
                            <th className="py-3 px-4 text-right">Revenue Generated</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sourceMatrix.map((s) => (
                            <tr key={s.key} className="hover:bg-slate-50/60">
                              <td className="py-3 px-4 font-bold text-slate-800">{s.label}</td>
                              <td className="py-3 px-4 text-center text-slate-700 font-semibold">{s.total}</td>
                              <td className="py-3 px-4 text-center text-emerald-700 font-bold">{s.confirmed}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="chip" style={{ background: "#F0FDF4", color: "#166534", borderColor: "#BBF7D0", fontSize: 11 }}>
                                  {s.convRate}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-900">
                                ₹{s.revenue.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. COUNSELLOR SCORECARD TAB */}
            {activeTab === "counsellors" && (
              <div className="space-y-6">
                <div className="card p-0 overflow-hidden">
                  <div className="p-5 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900">Staff & Counsellor Admissions Performance Scorecard</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Individual workload, walk-in hosting, and conversion efficiency tracking.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                          <th className="py-3 px-4">Counsellor</th>
                          <th className="py-3 px-4 text-center">Assigned Enquiries</th>
                          <th className="py-3 px-4 text-center">Walk-ins Hosted</th>
                          <th className="py-3 px-4 text-center">Admissions Confirmed</th>
                          <th className="py-3 px-4 text-center">Conversion %</th>
                          <th className="py-3 px-4 text-right">Collections Brought</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {counsellorMatrix.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-slate-400">
                              No counsellor performance records found
                            </td>
                          </tr>
                        ) : (
                          counsellorMatrix.map((c) => (
                            <tr key={c.name} className="hover:bg-slate-50/60">
                              <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[var(--blue-700)] text-white text-xs flex items-center justify-center font-bold">
                                  {c.name[0]}
                                </div>
                                {c.name}
                              </td>
                              <td className="py-3.5 px-4 text-center text-slate-700 font-semibold">{c.total}</td>
                              <td className="py-3.5 px-4 text-center text-amber-700 font-semibold">{c.walkins}</td>
                              <td className="py-3.5 px-4 text-center text-emerald-700 font-bold">{c.confirmed}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="chip" style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE", fontSize: 11 }}>
                                  {c.convRate}%
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
                                ₹{c.revenue.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. FINANCIAL LEDGER TAB */}
            {activeTab === "revenue" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Collections Summary Cards */}
                  <div className="card p-5 space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Collections Breakdown</h4>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/50">
                      <p className="text-xs text-slate-500 font-medium">Registration Fees Collected</p>
                      <p className="text-xl font-bold text-emerald-800 mt-1">₹{regFeeTotal.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-blue-50/50">
                      <p className="text-xs text-slate-500 font-medium">Tuition & Admission Fees</p>
                      <p className="text-xl font-bold text-[var(--blue-700)] mt-1">₹{admFeeTotal.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <p className="text-xs text-slate-500 font-medium">Total Gross Revenue</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalRevenue.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  {/* Payment Mode Distribution */}
                  <div className="card p-5 lg:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Payment Modes Accepted</h4>
                    <p className="text-xs text-slate-500">Distribution across UPI, Net Banking, Credit/Debit Cards, Cash, and Cheques</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {paymentModeList.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6">No payments recorded in this period</p>
                      ) : (
                        paymentModeList.map((m) => (
                          <div key={m.mode} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-slate-800">{m.mode}</span>
                              <span className="font-semibold text-slate-500">{m.pct}%</span>
                            </div>
                            <p className="text-base font-bold text-slate-900">₹{m.amount.toLocaleString("en-IN")}</p>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
                              <div className="h-full rounded-full bg-[var(--blue-700)]" style={{ width: `${m.pct}%` }} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Transactions List */}
                <div className="card p-0 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Recent Receipts & Transactions</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Audited payment log recorded in CRM</p>
                    </div>
                    <button
                      onClick={() => exportToCSV("fees")}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Download size={13} /> Export Ledger (CSV)
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                          <th className="py-3 px-4">Receipt #</th>
                          <th className="py-3 px-4">Student Candidate</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Mode</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4 text-right">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFees.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-slate-400">
                              No fee payment transactions found in selected period
                            </td>
                          </tr>
                        ) : (
                          filteredFees.slice(0, 10).map((f) => (
                            <tr key={f.id} className="hover:bg-slate-50/60">
                              <td className="py-3 px-4 font-bold text-[var(--blue-700)]">
                                #{f.receipt_number || "—"}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-900 block">{f.enquiry?.student_name || "—"}</span>
                                <span className="text-[11px] text-slate-400">{f.enquiry?.applying_class || ""}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="chip" style={{
                                  background: f.fee_type === "REGISTRATION" ? "#EFF6FF" : "#ECFDF5",
                                  color: f.fee_type === "REGISTRATION" ? "#1D4ED8" : "#047857",
                                  borderColor: f.fee_type === "REGISTRATION" ? "#BFDBFE" : "#A7F3D0",
                                  fontSize: 10,
                                }}>
                                  {f.fee_type}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900">
                                ₹{Number(f.amount).toLocaleString("en-IN")}
                              </td>
                              <td className="py-3 px-4 text-slate-600">{f.payment_mode}</td>
                              <td className="py-3 px-4 text-slate-500">{formatDate(f.payment_date)}</td>
                              <td className="py-3 px-4 text-right font-mono text-slate-500">
                                {f.transaction_reference || "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. GRADE DEMAND TAB */}
            {activeTab === "classes" && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Grade-wise Admissions Application Volume</h4>
                  <p className="text-xs text-slate-500 mb-6">Application distribution across academic standards</p>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classReport} barSize={20}>
                        <XAxis dataKey="class" tick={{ fontSize: 11, fill: "#64748B" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Applications" radius={[4, 4, 0, 0]}>
                          {classReport.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── CSV EXPORT MODAL ── */}
      {showExportModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowExportModal(false)}>
          <div className="modal max-w-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Export CRM Datasets (CSV)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Download live school records for auditing & analysis</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="btn-secondary h-8 w-8 p-0 rounded-lg">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => exportToCSV("enquiries")}
                className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-[var(--blue-700)] hover:bg-blue-50/30 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-[var(--blue-700)]">
                    Enquiries Master Register
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Complete student lead list, parent contacts, applying classes, and stages ({filteredEnquiries.length} rows)
                  </p>
                </div>
                <Download size={16} className="text-slate-400 group-hover:text-[var(--blue-700)]" />
              </button>

              <button
                onClick={() => exportToCSV("fees")}
                className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-600 hover:bg-emerald-50/30 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    Fee Collection & Revenue Ledger
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Receipt numbers, fee types, amounts, payment modes, and dates ({filteredFees.length} rows)
                  </p>
                </div>
                <Download size={16} className="text-slate-400 group-hover:text-emerald-700" />
              </button>

              <button
                onClick={() => exportToCSV("walkins")}
                className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-600 hover:bg-amber-50/30 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                    Campus Walk-in Log
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Parent tour schedule, host counsellors, outcomes, and tour remarks ({filteredWalkins.length} rows)
                  </p>
                </div>
                <Download size={16} className="text-slate-400 group-hover:text-amber-700" />
              </button>

              <button
                onClick={() => exportToCSV("documents")}
                className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-600 hover:bg-purple-50/30 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                    Document Verification Compliance Report
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Checklist status per student, files uploaded, and verification remarks ({documents.length} rows)
                  </p>
                </div>
                <Download size={16} className="text-slate-400 group-hover:text-purple-700" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen" style={{ color: "var(--text-sub)" }}>
          <Loader2 className="animate-spin mb-3" size={32} color="#1A56DB" />
          <p className="text-base font-semibold">Loading admissions reports...</p>
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}

