"use client";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { mockEnquiries, statusLabels } from "@/lib/mock-data";
import { LeadStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Phone } from "lucide-react";

const pipelineStatuses: LeadStatus[] = [
  "NEW", "FOLLOW_UP", "WALK_IN_SCHEDULED", "WALK_IN_DONE",
  "REGISTRATION_PENDING", "REGISTRATION_PAID", "ADMISSION_CONFIRMED",
];

const statusColumnColors: Record<string, { bg: string; border: string; dot: string }> = {
  NEW: { bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.2)", dot: "#3b82f6" },
  FOLLOW_UP: { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", dot: "#f59e0b" },
  WALK_IN_SCHEDULED: { bg: "rgba(139,92,246,0.06)", border: "rgba(139,92,246,0.2)", dot: "#8b5cf6" },
  WALK_IN_DONE: { bg: "rgba(6,182,212,0.06)", border: "rgba(6,182,212,0.2)", dot: "#06b6d4" },
  REGISTRATION_PENDING: { bg: "rgba(249,115,22,0.06)", border: "rgba(249,115,22,0.2)", dot: "#f97316" },
  REGISTRATION_PAID: { bg: "rgba(20,184,166,0.06)", border: "rgba(20,184,166,0.2)", dot: "#14b8a6" },
  ADMISSION_CONFIRMED: { bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)", dot: "#10b981" },
};

export default function PipelinePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Pipeline" subtitle="Kanban view of all enquiries" action={{ label: "New Enquiry", href: "/enquiries/new" }} />
      <div className="flex-1 p-6 fade-in overflow-x-auto">
        <div className="flex gap-4" style={{ minWidth: `${pipelineStatuses.length * 240}px` }}>
          {pipelineStatuses.map((status) => {
            const cards = mockEnquiries.filter(e => e.status === status);
            const { bg, border, dot } = statusColumnColors[status];
            return (
              <div key={status} className="flex-shrink-0" style={{ width: "230px" }}>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: dot }} />
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {statusLabels[status]}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: bg, color: dot, border: `1px solid ${border}` }}>
                    {cards.length}
                  </span>
                </div>

                {/* Column */}
                <div className="rounded-xl p-2 space-y-2 min-h-[200px]"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  {cards.length === 0 && (
                    <div className="text-center py-8 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      No enquiries
                    </div>
                  )}
                  {cards.map((e) => (
                    <Link href={`/enquiries/${e.id}`} key={e.id}
                      className="block rounded-xl p-3 transition-all hover:translate-y-[-1px]"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}>
                      <p className="text-xs font-semibold text-white truncate">{e.studentName}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{e.applyingClass}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Phone size={9} style={{ color: "var(--text-muted)" }} />
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{e.primaryContact}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{formatDate(e.enquiryDate)}</span>
                        {e.counsellorName && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                            {e.counsellorName.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
