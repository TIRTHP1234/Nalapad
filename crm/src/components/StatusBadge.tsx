import { cn } from "@/lib/utils";
import { LeadStatus } from "@/lib/types";

const cfg: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  NEW:                  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", dot: "#EA580C", label: "New Lead" },
  FOLLOW_UP:            { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#D97706", label: "Follow Up" },
  WALK_IN_SCHEDULED:    { bg: "#F5F3FF", text: "#5B21B6", border: "#DDD6FE", dot: "#7C3AED", label: "Walk-in Scheduled" },
  WALK_IN_DONE:         { bg: "#ECFEFF", text: "#155E75", border: "#A5F3FC", dot: "#0891B2", label: "Walk-in Completed" },
  REGISTRATION_PENDING: { bg: "#FFF7ED", text: "#9A3412", border: "#FDBA74", dot: "#EA580C", label: "Reg. Pending" },
  REGISTRATION_PAID:    { bg: "#F0FDFA", text: "#134E4A", border: "#99F6E4", dot: "#0D9488", label: "Registered" },
  ADMISSION_PENDING:    { bg: "#EEF2FF", text: "#3730A3", border: "#C7D2FE", dot: "#4F46E5", label: "Admission Pending" },
  ADMISSION_CONFIRMED:  { bg: "#F0FDF4", text: "#15803D", border: "#86EFAC", dot: "#16A34A", label: "Confirmed" },
  ADMISSION_CANCELLED:  { bg: "#FEF2F2", text: "#7F1D1D", border: "#FECACA", dot: "#DC2626", label: "Cancelled" },
  DNP:                  { bg: "#F8FAFC", text: "#475569", border: "#CBD5E1", dot: "#64748B", label: "Did Not Proceed" },
};

export default function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const s = cfg[status] || { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#64748B", label: status };
  return (
    <span
      className={cn("status-badge inline-flex items-center gap-1.5 font-medium", className)}
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      <span>{s.label}</span>
    </span>
  );
}
