"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarCheck, Building2, FileText,
  BarChart3, Settings, LogOut, GraduationCap, ClipboardList, Layers, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { href: "/enquiries",  label: "Enquiries",   icon: Users },
  { href: "/pipeline",   label: "Pipeline",    icon: Layers },
  { href: "/followups",  label: "Follow-ups",  icon: CalendarCheck },
  { href: "/walkins",    label: "Walk-ins",    icon: Building2 },
  { href: "/tasks",      label: "Tasks",       icon: ClipboardList },
  { href: "/documents",  label: "Documents",   icon: FileText },
  { href: "/reports",    label: "Reports",     icon: BarChart3 },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[224px] flex flex-col z-40"
      style={{ background: "#0E2148", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", lineHeight: 1.2 }}>
              Nalapad
            </p>
            <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.42)", marginTop: 2 }}>
              Admission CRM
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.28)", padding: "0 10px", marginBottom: 10 }}>
          Main Menu
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link key={href} href={href} className={cn("sidebar-link", active && "active")}>
              <Icon size={17} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14 }}>{label}</span>
              {active && <ChevronRight size={13} style={{ opacity: 0.45 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/settings" className={cn("sidebar-link mb-2", path === "/settings" && "active")}>
          <Settings size={17} /><span style={{ fontSize: 14 }}>Settings</span>
        </Link>
        {/* User */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mt-1"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-700 text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#3B82F6,#1A56DB)" }}>
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>Super Admin</p>
            <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>admin@nalapad.edu</p>
          </div>
          <LogOut size={14} style={{ color: "rgba(255,255,255,0.32)", cursor: "pointer", flexShrink: 0 }}
            className="hover:text-red-400 transition-colors" />
        </div>
      </div>
    </aside>
  );
}
