"use client";
import Topbar from "@/components/Topbar";
import { mockEnquiries } from "@/lib/mock-data";
import { leadSourceLabels, statusLabels } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, BarChart3 } from "lucide-react";

const sourceReport = Object.entries(leadSourceLabels).map(([k, label]) => ({
  source: label.length > 14 ? label.substring(0, 14) + "…" : label,
  count: mockEnquiries.filter(e => e.leadSource === k).length,
})).filter(r => r.count > 0);

const counsellorReport = [
  { name: "Priya S.", total: 3, converted: 1, walkins: 2 },
  { name: "Rahul V.", total: 3, converted: 0, walkins: 1 },
  { name: "Sneha P.", total: 2, converted: 1, walkins: 1 },
];

const classReport = [
  { class: "Grade 1", count: 1 }, { class: "Grade 2", count: 1 }, { class: "Grade 3", count: 1 },
  { class: "Grade 4", count: 1 }, { class: "Grade 5", count: 1 }, { class: "Grade 6", count: 1 },
  { class: "Grade 8", count: 1 }, { class: "Grade 9", count: 1 },
];

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#f97316"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl p-3 text-xs shadow-xl" style={{ border: "1px solid var(--border-light)" }}>
        <p className="font-semibold mb-1 text-white">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || p.fill }}>{p.name}: <b>{p.value}</b></p>
        ))}
      </div>
    );
  }
  return null;
};

const reports = [
  { id: "source", label: "Enquiry Source Performance", desc: "Which channels generate best leads" },
  { id: "counsellor", label: "Counsellor Performance", desc: "Per-counsellor conversion metrics" },
  { id: "class", label: "Class-wise Enquiries", desc: "Demand per grade" },
  { id: "followup", label: "Follow-up Performance", desc: "Quality of engagement" },
  { id: "overdue", label: "Overdue Tasks", desc: "Staff accountability" },
  { id: "walkin", label: "Walk-in Performance", desc: "Visit-to-registration conversion" },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Reports & Analytics" subtitle="Flexible reporting for management" action={{ label: "Export All", href: "#" }} />
      <div className="flex-1 p-6 space-y-6 fade-in">

        {/* Report Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {reports.map(r => (
            <div key={r.id} className="card flex items-center gap-3 cursor-pointer hover:border-indigo-500/30 transition-all" style={{ padding: "14px 16px" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                <BarChart3 size={15} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{r.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Enquiry Source Performance</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Total by source</p>
              </div>
              <button className="btn-secondary text-xs py-1.5 px-3"><Download size={12} /> Export</button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sourceReport} barSize={14}>
                <XAxis dataKey="source" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Enquiries" radius={[4, 4, 0, 0]}>
                  {sourceReport.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Counsellor Performance</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Total vs Converted</p>
              </div>
              <button className="btn-secondary text-xs py-1.5 px-3"><Download size={12} /> Export</button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={counsellorReport} barSize={14} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total Enquiries" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" name="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="walkins" name="Walk-ins" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Class-wise Enquiries</h3>
              <button className="btn-secondary text-xs py-1.5 px-3"><Download size={12} /> Export</button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={classReport} barSize={14} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="class" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Enquiries" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                  {classReport.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Status Distribution</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(statusLabels).map(([status, label]) => {
                const count = mockEnquiries.filter(e => e.status === status).length;
                const pct = Math.round((count / mockEnquiries.length) * 100);
                if (count === 0) return null;
                const color = COLORS[Object.keys(statusLabels).indexOf(status) % COLORS.length];
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span className="font-semibold text-white">{count} <span style={{ color: "var(--text-muted)" }}>({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(30,45,74,0.6)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
