"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { statusLabels } from "@/lib/mock-data";
import { LeadStatus, Enquiry } from "@/lib/types";
import { formatDate, mapEnquiryFromDb } from "@/lib/utils";
import Link from "next/link";
import { Phone, Users, Plus } from "lucide-react";

const pipelineStatuses: LeadStatus[] = [
  "NEW", "FOLLOW_UP", "WALK_IN_SCHEDULED", "WALK_IN_DONE",
  "REGISTRATION_PENDING", "REGISTRATION_PAID", "ADMISSION_CONFIRMED",
];

const statusColumnColors: Record<string, { bg: string; border: string; dot: string }> = {
  NEW: { bg: "#F0F9FF", border: "#BAE6FD", dot: "#0284C7" },
  FOLLOW_UP: { bg: "#FFFBEB", border: "#FDE68A", dot: "#D97706" },
  WALK_IN_SCHEDULED: { bg: "#FAF5FF", border: "#E9D5FF", dot: "#7C3AED" },
  WALK_IN_DONE: { bg: "#F0FDFA", border: "#99F6E4", dot: "#0D9488" },
  REGISTRATION_PENDING: { bg: "#FFF7ED", border: "#FFEDD5", dot: "#EA580C" },
  REGISTRATION_PAID: { bg: "#ECFDF5", border: "#A7F3D0", dot: "#059669" },
  ADMISSION_CONFIRMED: { bg: "#F0FDF4", border: "#BBF7D0", dot: "#16A34A" },
};

export default function PipelinePage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch("/api/enquiries");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setEnquiries(json.data.map(mapEnquiryFromDb));
        }
      } catch (err) {
        console.error("Pipeline fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLive();
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Topbar title="Pipeline" subtitle="Kanban view of admission leads" action={{ label: "New Enquiry", href: "/enquiries/new" }} />
      <div className="flex-1 p-7 fade-in overflow-x-auto">
        <div className="flex gap-4.5 pb-6" style={{ minWidth: `${pipelineStatuses.length * 265}px` }}>
          {pipelineStatuses.map((status) => {
            const cards = enquiries.filter(e => e.status === status);
            const { bg, border, dot } = statusColumnColors[status];
            return (
              <div key={status} className="flex-shrink-0" style={{ width: "260px" }}>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
                    <span className="text-xs font-bold" style={{ color: "var(--text-h)" }}>
                      {statusLabels[status]}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full"
                    style={{ background: bg, color: dot, border: `1px solid ${border}` }}>
                    {cards.length}
                  </span>
                </div>

                {/* Column */}
                <div className="rounded-xl p-2.5 space-y-2.5 min-h-[300px]"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  {cards.length === 0 && (
                    <div className="text-center py-12 text-xs font-500" style={{ color: "var(--text-muted)" }}>
                      No enquiries
                    </div>
                  )}
                  {cards.map((e) => (
                    <Link href={`/enquiries/${e.id}`} key={e.id}
                      className="block rounded-xl p-3.5 transition-all hover:shadow-md hover:translate-y-[-1px]"
                      style={{
                        background: "#fff",
                        border: "1px solid #D8E0EB",
                        boxShadow: "0 2px 6px rgba(13,27,46,0.05)",
                      }}>
                      <p className="text-sm font-bold truncate" style={{ color: "var(--text-h)" }}>{e.studentName}</p>
                      <p className="text-xs mt-0.5 font-500" style={{ color: "var(--text-muted)" }}>{e.applyingClass}</p>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <Phone size={12} style={{ color: "var(--blue-700)" }} />
                        <p className="text-xs font-500" style={{ color: "var(--text-sub)" }}>{e.primaryContact}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: "1px solid #EEF2F7" }}>
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{formatDate(e.enquiryDate)}</span>
                        {e.counsellorName && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: "var(--blue-700)" }}>
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
