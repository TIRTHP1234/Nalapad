import { cn } from "@/lib/utils";
import { LeadStatus } from "@/lib/types";

const cfg: Record<string, { bg: string; text: string; border: string; label: string }> = {
  NEW:                  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", label: "🆕 New" },
  FOLLOW_UP:            { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", label: "📞 Follow Up" },
  WALK_IN_SCHEDULED:    { bg: "#F5F3FF", text: "#5B21B6", border: "#DDD6FE", label: "🏫 Walk-in Scheduled" },
  WALK_IN_DONE:         { bg: "#ECFEFF", text: "#155E75", border: "#A5F3FC", label: "✅ Walk-in Done" },
  REGISTRATION_PENDING: { bg: "#FFF7ED", text: "#9A3412", border: "#FDBA74", label: "⏳ Reg. Pending" },
  REGISTRATION_PAID:    { bg: "#F0FDFA", text: "#134E4A", border: "#99F6E4", label: "💳 Registered" },
  ADMISSION_PENDING:    { bg: "#EEF2FF", text: "#3730A3", border: "#C7D2FE", label: "📋 Adm. Pending" },
  ADMISSION_CONFIRMED:  { bg: "#F0FDF4", text: "#15803D", border: "#86EFAC", label: "✅ Confirmed" },
  ADMISSION_CANCELLED:  { bg: "#FEF2F2", text: "#7F1D1D", border: "#FECACA", label: "❌ Cancelled" },
  DNP:                  { bg: "#F9FAFB", text: "#374151", border: "#D1D5DB", label: "🚫 Did Not Proceed" },
};

export default function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const s = cfg[status] || { bg: "#F3F4F6", text: "#4B5563", border: "#D1D5DB", label: status };
  return (
    <span
      className={cn("status-badge", className)}
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}
