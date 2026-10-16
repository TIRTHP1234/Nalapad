"use client";
import { Bell, Search, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export default function Topbar({ title, subtitle, action }: TopbarProps) {
  const [search, setSearch] = useState("");

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-7 py-4"
      style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 3px rgba(13,27,46,0.04)",
      }}
    >
      {/* Left: Title & Subtitle */}
      <div className="min-w-0 pr-4">
        <h1
          className="text-lg font-bold truncate"
          style={{ color: "var(--text-h)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.015em" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs font-500 mt-0.5 truncate" style={{ color: "var(--text-sub)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Search + Bell + CTA Action */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Global Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search leads, parents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 text-xs"
            style={{ height: "38px", width: "230px" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 p-0.5 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Notification Bell */}
        <button
          title="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-gray-50 cursor-pointer"
          style={{ background: "#FFFFFF", border: "1px solid var(--border)" }}
        >
          <Bell size={16} style={{ color: "var(--text-sub)" }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Action Button */}
        {action && (
          action.href ? (
            <Link href={action.href} className="btn-primary" style={{ padding: "8.5px 16px", minHeight: "38px" }}>
              <Plus size={15} /> {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className="btn-primary" style={{ padding: "8.5px 16px", minHeight: "38px" }}>
              <Plus size={15} /> {action.label}
            </button>
          )
        )}
      </div>
    </header>
  );
}
