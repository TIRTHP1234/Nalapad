"use client";
import Topbar from "@/components/Topbar";
import { Settings, User, Bell, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Settings" subtitle="System configuration" />
      <div className="flex-1 p-6 fade-in">
        <div className="max-w-2xl space-y-4">
          {[
            { icon: User, label: "Profile & Account", desc: "Update your name, email and password" },
            { icon: Bell, label: "Notifications", desc: "Configure email and in-app alerts" },
            { icon: Shield, label: "Roles & Permissions", desc: "Manage user roles and access" },
            { icon: Database, label: "Academic Years & Classes", desc: "Configure classes, campus and academic years" },
            { icon: Settings, label: "System Configuration", desc: "Assignment rules and system defaults" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="card flex items-center gap-4 cursor-pointer hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
              <span style={{ color: "var(--text-muted)" }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
