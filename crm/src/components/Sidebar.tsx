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

import { Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";

function SidebarInner() {
  const path = usePathname();
  const { user, signOut } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "ST";

  const roleLabel =
    user?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user?.role === "PRINCIPAL"
      ? "Principal"
      : user?.role === "ADMISSION_COUNSELLOR"
      ? "Counsellor"
      : "Staff";
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[224px] flex flex-col z-40"
      style={{ background: "#1C1917", borderRight: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(249,115,22,0.22)", border: "1px solid rgba(249,115,22,0.35)" }}>
            <GraduationCap size={20} color="#F97316" />
          </div>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", lineHeight: 1.2 }}>
              Nalapad
            </p>
            <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.40)", marginTop: 2 }}>
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
      <div className="px-3 pb-5 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/settings" className={cn("sidebar-link mb-2", path === "/settings" && "active")}>
          <Settings size={17} /><span style={{ fontSize: 14 }}>Settings</span>
        </Link>
        {/* User Profile */}
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-1"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{
              background: user?.role === "SUPER_ADMIN"
                ? "linear-gradient(135deg, #F97316, #EA580C)"
                : user?.role === "PRINCIPAL"
                ? "linear-gradient(135deg, #D97706, #B45309)"
                : "linear-gradient(135deg, #F97316, #C2410C)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {user?.fullName || "Staff Member"}
            </p>
            <p className="text-[10px] text-slate-300 font-semibold truncate leading-tight mt-0.5">
              {roleLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            title="Sign out of CRM"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0 border-0 bg-transparent"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="fixed left-0 top-0 h-screen w-[224px] z-40" style={{ background: "#1C1917" }} />}>
      <SidebarInner />
    </Suspense>
  );
}
