"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, mapEnquiryFromDb } from "@/lib/utils";
import { Enquiry } from "@/lib/types";
import Link from "next/link";
import {
  Users, CalendarCheck, AlertTriangle, Building2,
  CheckCircle2, TrendingUp, IndianRupee, UserCheck, FileCheck, Plus, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const SOURCE_COLORS: Record<string, string> = {
  WEBSITE: "#F97316",
  GOOGLE_ADS: "#0891B2",
  META_ADS: "#D97706",
  WALK_IN: "#047857",
  REFERRAL: "#7C3AED",
  EDUCATION_FAIR: "#EA580C",
  HOARDING: "#6B7280",
  NEWSPAPER: "#EC4899",
  OTHER: "#94A3B8",
};

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #D8E0EB",
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 6px 20px rgba(13,27,46,0.12)",
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#0D1B2E", marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: 13, color: p.color || p.fill, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    newEnquiries: 0,
    followUps: 0,
    walkIns: 0,
    registered: 0,
    admissionsConfirmed: 0,
    dnp: 0,
    conversionRate: 0,
    todayFollowUps: 0,
    overdueFollowUps: 0,
    openTasks: 0,
    registrationFees: 0,
    admissionFees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, enqRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/enquiries"),
        ]);

        if (statsRes.ok) {
          const sJson = await statsRes.json();
          if (sJson.data) setStats(sJson.data);
        }

        if (enqRes.ok) {
          const eJson = await enqRes.json();
          if (eJson.data && Array.isArray(eJson.data)) {
            setEnquiries(eJson.data.map(mapEnquiryFromDb));
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const walkInsScheduled = enquiries.filter(e => e.status === "WALK_IN_SCHEDULED").length;
  const walkInsDone = enquiries.filter(e => e.status === "WALK_IN_DONE").length;
  const registrationsCount = enquiries.filter(e => ["REGISTRATION_PENDING", "REGISTRATION_PAID"].includes(e.status)).length;
  const admissionsCount = enquiries.filter(e => e.status === "ADMISSION_CONFIRMED").length;

  // Primary High-Level KPIs
  const primaryKpis = [
    { label: "Total Enquiries",   value: stats.totalEnquiries,   icon: Users,         color: "#F97316", bg: "#FFF7ED", desc: "All recorded leads" },
    { label: "New Enquiries",     value: stats.newEnquiries,     icon: TrendingUp,    color: "#EA580C", bg: "#FFEDD5", desc: "Pending initial contact" },
    { label: "Follow-ups Due",    value: stats.todayFollowUps,   icon: CalendarCheck, color: "#D97706", bg: "#FFFBEB", desc: "Scheduled for today" },
    { label: "Overdue Attention", value: stats.overdueFollowUps, icon: AlertTriangle,  color: "#DC2626", bg: "#FEF2F2", desc: "Follow-ups missed SLA" },
  ];

  // Secondary Funnel & Revenue KPIs
  const secondaryKpis = [
    { label: "Walk-ins Scheduled",   value: walkInsScheduled,          icon: Building2,     color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Walk-ins Done",        value: walkInsDone,               icon: CheckCircle2,  color: "#047857", bg: "#ECFDF5" },
    { label: "Registrations",        value: registrationsCount,        icon: FileCheck,     color: "#0F766E", bg: "#F0FDFA" },
    { label: "Confirmed Admissions", value: admissionsCount,           icon: UserCheck,     color: "#15803D", bg: "#F0FDF4" },
    { label: "Conversion Rate",      value: `${stats.conversionRate}%`,icon: TrendingUp,    color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Registration Fees",    value: `₹${(stats.registrationFees || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "#D97706", bg: "#FFFBEB" },
    { label: "Admission Fees",       value: `₹${(stats.admissionFees || 0).toLocaleString("en-IN")}`,    icon: IndianRupee, color: "#047857", bg: "#ECFDF5" },
  ];

  // Dynamic monthly trend from actual enquiries
  const trendMap: Record<string, { month: string; enquiries: number; admissions: number }> = {};
  enquiries.forEach(e => {
    const d = new Date(e.enquiryDate);
    if (!isNaN(d.getTime())) {
      const m = d.toLocaleString("default", { month: "short" });
      if (!trendMap[m]) trendMap[m] = { month: m, enquiries: 0, admissions: 0 };
      trendMap[m].enquiries += 1;
      if (e.status === "ADMISSION_CONFIRMED") trendMap[m].admissions += 1;
    }
  });
  const trendData = Object.values(trendMap);

  // Dynamic lead source breakdown
  const sourceMap: Record<string, number> = {};
  enquiries.forEach(e => {
    const src = e.leadSource || "OTHER";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).map(([k, val]) => ({
    name: k.replace(/_/g, " "),
    value: val,
    color: SOURCE_COLORS[k] || "#6366f1",
  }));

  // Dynamic counsellor performance
  const counsellorMap: Record<string, { name: string; enquiries: number; conversions: number }> = {};
  enquiries.forEach(e => {
    if (e.counsellorName) {
      if (!counsellorMap[e.counsellorName]) {
        counsellorMap[e.counsellorName] = { name: e.counsellorName.split(" ")[0], enquiries: 0, conversions: 0 };
      }
      counsellorMap[e.counsellorName].enquiries += 1;
      if (e.status === "ADMISSION_CONFIRMED") {
        counsellorMap[e.counsellorName].conversions += 1;
      }
    }
  });
  const counsellorData = Object.values(counsellorMap);

  const recent = [...enquiries]
    .sort((a, b) => new Date(b.createdAt || b.enquiryDate).getTime() - new Date(a.createdAt || a.enquiryDate).getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Topbar
        title="Admissions Dashboard"
        subtitle="Live Admissions Pipeline · Nalapad Academy"
        action={{ label: "New Enquiry", href: "/enquiries/new" }}
      />

      <div className="p-7 space-y-7 fade-in max-w-[1600px] mx-auto w-full">

        {/* ── TOP KPI HIGHLIGHTS ── */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">
              Key Admission Indicators
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {primaryKpis.map(({ label, value, icon: Icon, color, bg, desc }) => (
              <div key={label} className="kpi-card" style={{ "--kpi-color": color } as React.CSSProperties}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: bg, color }}>
                    Live
                  </span>
                </div>
                <p className="text-3xl font-extrabold mb-1 tracking-tight" style={{ color: "var(--text-h)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {value}
                </p>
                <p className="text-sm font-bold" style={{ color: "var(--text-h)" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECONDARY PIPELINE & REVENUE KPIS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {secondaryKpis.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 transition-all hover:translate-y-[-1px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-sub)" }}>{label}</p>
              </div>
              <p className="text-xl font-bold tracking-tight" style={{ color: "var(--text-h)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Area Chart: Monthly Trend */}
          <div className="xl:col-span-2 card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-h)" }}>Enquiry & Admission Trend</h3>
                <p className="text-xs font-500 mt-1" style={{ color: "var(--text-sub)" }}>Monthly enquiry inflow vs confirmed admissions</p>
              </div>
            </div>
            {trendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[220px] text-center" style={{ color: "var(--text-sub)" }}>
                <TrendingUp size={36} style={{ opacity: 0.25, marginBottom: 10 }} />
                <p className="text-sm font-bold" style={{ color: "var(--text-h)" }}>No trend data recorded yet</p>
                <p className="text-xs mt-1 max-w-sm">Monthly progression charts will plot automatically as admissions are processed</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#047857" stopOpacity={0.16} />
                        <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#52667E" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#52667E" }} allowDecimals={false} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="enquiries" name="Enquiries"
                      stroke="#F97316" strokeWidth={2.5} fill="url(#orangeGrad)" />
                    <Area type="monotone" dataKey="admissions" name="Admissions"
                      stroke="#047857" strokeWidth={2.5} fill="url(#greenGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 mt-4 pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                  {[{ c: "#F97316", l: "Enquiries" }, { c: "#047857", l: "Admissions" }].map(({ c, l }) => (
                    <div key={l} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: c }} />
                      <span className="text-xs font-600" style={{ color: "var(--text-sub)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pie Chart: Lead Sources */}
          <div className="card p-6">
            <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-h)" }}>Lead Sources</h3>
            <p className="text-xs font-500 mb-5" style={{ color: "var(--text-sub)" }}>Origin channel breakdown</p>
            {sourceData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[220px] text-center" style={{ color: "var(--text-sub)" }}>
                <p className="text-sm font-bold" style={{ color: "var(--text-h)" }}>No source data recorded</p>
                <p className="text-xs mt-1 max-w-xs">Channels will populate as new student enquiries are created</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                      dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {sourceData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4 pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                  {sourceData.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center justify-between text-xs py-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="font-500" style={{ color: "var(--text-body)" }}>{name}</span>
                      </div>
                      <span className="font-bold" style={{ color: "var(--text-h)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── BOTTOM ROW: COUNSELLOR & RECENT LEADS ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Counsellor Performance */}
          <div className="card p-6">
            <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-h)" }}>Counsellor Performance</h3>
            <p className="text-xs font-500 mb-5" style={{ color: "var(--text-sub)" }}>Enquiries assigned vs converted</p>
            {counsellorData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[180px] text-center" style={{ color: "var(--text-sub)" }}>
                <Users size={32} style={{ opacity: 0.25, marginBottom: 8 }} />
                <p className="text-sm font-bold" style={{ color: "var(--text-h)" }}>No counsellor activity yet</p>
                <p className="text-xs mt-1">Metrics calculate when staff are assigned to leads</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={counsellorData} barSize={14}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#52667E" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#52667E" }} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="enquiries" name="Enquiries" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" name="Conversions" fill="#047857" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Enquiries Table */}
          <div className="xl:col-span-2 card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4.5"
              style={{ borderBottom: "1px solid var(--border)", background: "#F8FAFD" }}>
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-h)" }}>Recent Admissions Enquiries</h3>
                <p className="text-xs font-500 mt-0.5" style={{ color: "var(--text-sub)" }}>Latest candidates in admissions pipeline</p>
              </div>
              <Link href="/enquiries" className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color: "var(--orange)" }}>
                View All Enquiries <ChevronRight size={14} />
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: "var(--text-sub)" }}>
                <Users size={38} style={{ opacity: 0.25, marginBottom: 10 }} />
                <p className="text-base font-bold" style={{ color: "var(--text-h)" }}>No enquiries recorded yet</p>
                <p className="text-xs mt-1 mb-4" style={{ color: "var(--text-sub)" }}>Get started by recording your first admission lead into Nalapad CRM.</p>
                <Link href="/enquiries/new" className="btn-primary text-xs py-2 px-4">
                  <Plus size={14} /> Create First Enquiry
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(e => (
                      <tr key={e.id}>
                        <td>
                          <Link href={`/enquiries/${e.id}`}>
                            <p className="font-bold text-sm hover:underline" style={{ color: "var(--text-h)" }}>{e.studentName}</p>
                            <p className="text-xs mt-0.5 font-500" style={{ color: "var(--text-muted)" }}>{e.primaryContact}</p>
                          </Link>
                        </td>
                        <td className="text-sm font-semibold">{e.applyingClass}</td>
                        <td className="text-sm">
                          <span className="chip" style={{ background: "#FFF7ED", color: "#C2410C", borderColor: "#FED7AA" }}>
                            {e.leadSource.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td><StatusBadge status={e.status} /></td>
                        <td className="text-xs font-500" style={{ color: "var(--text-sub)" }}>
                          {formatDate(e.enquiryDate)}
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
    </div>
  );
}
