"use client";
import Topbar from "@/components/Topbar";
import { Building2, Plus, CheckCircle2, Clock, XCircle } from "lucide-react";
import { mockEnquiries } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const walkins = mockEnquiries.filter(e =>
  e.status === "WALK_IN_SCHEDULED" || e.status === "WALK_IN_DONE"
);

export default function WalkInsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Walk-ins" subtitle="Manage school visit scheduling" action={{ label: "Schedule Walk-in", href: "#" }} />
      <div className="flex-1 p-6 space-y-5 fade-in">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Scheduled", count: mockEnquiries.filter(e => e.status === "WALK_IN_SCHEDULED").length, color: "#8b5cf6", icon: Clock },
            { label: "Completed", count: mockEnquiries.filter(e => e.status === "WALK_IN_DONE").length, color: "#10b981", icon: CheckCircle2 },
            { label: "Total", count: walkins.length, color: "#6366f1", icon: Building2 },
          ].map(({ label, count, color, icon: Icon }) => (
            <div key={label} className="card text-center" style={{ padding: "20px" }}>
              <Icon size={22} className="mx-auto mb-2" style={{ color }} />
              <p className="text-2xl font-bold" style={{ color }}>{count}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold text-white">Walk-in Records</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Counsellor</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {walkins.map(e => (
                <tr key={e.id}>
                  <td>
                    <p className="font-semibold text-white text-sm">{e.studentName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{e.primaryContact}</p>
                  </td>
                  <td>{e.applyingClass}</td>
                  <td>{e.counsellorName}</td>
                  <td>
                    <span className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: e.status === "WALK_IN_DONE" ? "#10b981" : "#8b5cf6" }}>
                      {e.status === "WALK_IN_DONE" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {e.status === "WALK_IN_DONE" ? "Completed" : "Scheduled"}
                    </span>
                  </td>
                  <td>{formatDate(e.enquiryDate)}</td>
                  <td>
                    <Link href={`/enquiries/${e.id}`} className="text-xs" style={{ color: "#6366f1" }}>View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
