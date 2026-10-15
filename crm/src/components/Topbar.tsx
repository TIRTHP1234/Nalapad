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
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5"
      style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 4px rgba(13,27,42,0.06)",
      }}
    >
      {/* Left: Title */}
      <div>
        <h1
          className="text-base font-bold"
          style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Search + Bell + CTA */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={13} className="absolute left-3 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search enquiries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-8 text-xs"
            style={{ height: "34px", width: "210px" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5">
              <X size={12} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>

        {/* Notification bell */}
        <button
          className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
        >
          <Bell size={14} style={{ color: "var(--text-secondary)" }} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* Action CTA */}
        {action && (
          action.href ? (
            <Link href={action.href} className="btn-primary" style={{ fontSize: "13px", padding: "7px 15px" }}>
              <Plus size={14} /> {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className="btn-primary" style={{ fontSize: "13px", padding: "7px 15px" }}>
              <Plus size={14} /> {action.label}
            </button>
          )
        )}
      </div>
    </header>
  );
}
