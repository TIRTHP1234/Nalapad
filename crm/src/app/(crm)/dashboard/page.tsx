"use client";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { mockDashboardKPIs, mockEnquiries } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Users, CalendarCheck, AlertTriangle, Building2,
  CheckCircle2, TrendingUp, IndianRupee, UserCheck, FileCheck, Clock,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ── KPI definitions ── */
const kpis = [
  { label: "Total Enquiries",      value: 8,      icon: Users,         color: "#1A56DB", bg: "#EBF1FF" },
  { label: "New Enquiries",        value: 2,      icon: TrendingUp,    color: "#0891B2", bg: "#ECFEFF" },
  { label: "Follow-ups Due",       value: 3,      icon: CalendarCheck, color: "#D97706", bg: "#FFFBEB" },
  { label: "Overdue Tasks",        value: 2,      icon: AlertTriangle, color: "#DC2626", bg: "#FEF2F2" },
  { label: "Walk-ins Scheduled",   value: 1,      icon: Building2,     color: "#7C3AED", bg: "#F5F3FF" },
  { label: "Walk-ins Done",        value: 2,      icon: CheckCircle2,  color: "#047857", bg: "#ECFDF5" },
  { label: "Registrations",        value: 2,      icon: FileCheck,     color: "#0F766E", bg: "#F0FDFA" },
  { label: "Confirmed Admissions", value: 1,      icon: UserCheck,     color: "#15803D", bg: "#F0FDF4" },
  { label: "Conversion Rate",      value: "12.5%",icon: TrendingUp,    color: "#7C3AED", bg: "#F5F3FF" },
  { label: "Registration Fees",    value: "₹10K", icon: IndianRupee,   color: "#D97706", bg: "#FFFBEB" },
  { label: "Admission Fees",       value: "₹45K", icon: IndianRupee,   color: "#047857", bg: "#ECFDF5" },
];

const trendData = [
  { month: "Jul", enquiries: 12, admissions: 2 },
  { month: "Aug", enquiries: 18, admissions: 3 },
  { month: "Sep", enquiries: 25, admissions: 5 },
  { month: "Oct", enquiries: 8,  admissions: 1 },
];

const sourceData = [
  { name: "Website",    value: 3, color: "#1A56DB" },
  { name: "Google Ads", value: 1, color: "#0891B2" },
  { name: "Meta",       value: 1, color: "#D97706" },
  { name: "Walk-in",    value: 1, color: "#047857" },
  { name: "Referral",   value: 2, color: "#7C3AED" },
];

const counsellorData = [
  { name: "Priya S.",  enquiries: 3, conversions: 1 },
  { name: "Rahul V.",  enquiries: 3, conversions: 0 },
  { name: "Sneha P.",  enquiries: 2, conversions: 1 },
];

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #D8E0EB",
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(13,27,46,0.12)",
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
  const recent = [...mockEnquiries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Topbar
        title="Dashboard"
        subtitle="Academic Year 2025–26 · Nalapad School"
        action={{ label: "New Enquiry", href: "/enquiries/new" }}
      />

      <div className="p-6 space-y-6 fade-in">

        {/* ── KPI GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {kpis.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="kpi-card" style={{ "--kpi-color": color } as React.CSSProperties}>
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: bg }}>
                <Icon size={22} style={{ color }} />
              </div>
              {/* Number */}
              <p className="text-3xl font-bold mb-1" style={{ color: "#0D1B2E", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {value}
              </p>
              {/* Label */}
              <p className="text-sm font-500" style={{ color: "var(--text-sub)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid xl:grid-cols-3 gap-5">

          {/* Area chart */}
          <div className="xl:col-span-2 card" style={{ padding: "22px 24px" }}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-h)" }}>Enquiry & Admission Trend</h3>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-sub)" }}>Monthly overview for 2025</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#1A56DB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 13, fill: "#5A6E84" }} />
                <YAxis tick={{ fontSize: 13, fill: "#5A6E84" }} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="enquiries" name="Enquiries"
                  stroke="#1A56DB" strokeWidth={2.5} fill="url(#blueGrad)" />
                <Area type="monotone" dataKey="admissions" name="Admissions"
                  stroke="#047857" strokeWidth={2.5} fill="url(#greenGrad)" />
              </AreaChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex items-center gap-6 mt-3">
              {[{ c: "#1A56DB", l: "Enquiries" }, { c: "#047857", l: "Admissions" }].map(({ c, l }) => (
                <div key={l} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: c }} />
                  <span className="text-sm font-500" style={{ color: "var(--text-sub)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie chart */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-h)" }}>Lead Sources</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-sub)" }}>Enquiry origin breakdown</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={48} outerRadius={68}
                  dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {sourceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 mt-2">
              {sourceData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-sm" style={{ color: "var(--text-body)" }}>{name}</span>
                  </div>
                  <span className="text-sm font-700" style={{ color: "var(--text-h)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="grid xl:grid-cols-3 gap-5">

          {/* Counsellor bar */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-h)" }}>Counsellor Performance</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-sub)" }}>Enquiries vs conversions</p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={counsellorData} barSize={12}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5A6E84" }} />
                <YAxis tick={{ fontSize: 12, fill: "#5A6E84" }} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="enquiries" name="Enquiries" fill="#1A56DB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversions" name="Conversions" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Enquiries */}
          <div className="xl:col-span-2 card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-h)" }}>Recent Enquiries</h3>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-sub)" }}>Latest 6 admission leads</p>
              </div>
              <Link href="/enquiries" className="text-sm font-600" style={{ color: "var(--blue-700)" }}>
                View All →
              </Link>
            </div>
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
                        <p className="font-700 text-sm" style={{ color: "var(--text-h)" }}>{e.studentName}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{e.primaryContact}</p>
                      </Link>
                    </td>
                    <td className="text-sm font-500">{e.applyingClass}</td>
                    <td className="text-sm" style={{ color: "var(--text-sub)" }}>
                      {e.leadSource.replace(/_/g, " ")}
                    </td>
                    <td><StatusBadge status={e.status} /></td>
                    <td className="text-sm" style={{ color: "var(--text-sub)" }}>
                      {formatDate(e.enquiryDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
