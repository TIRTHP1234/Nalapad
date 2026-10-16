"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import {
  Settings, User, Bell, Shield, Database, Plus, CheckCircle2,
  AlertCircle, Loader2, Users, Mail, Lock, ShieldCheck, RefreshCw, X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function SettingsPage() {
  const { user, isSuperAdmin, isPrincipal } = useAuth();
  const [activeTab, setActiveTab] = useState<"staff" | "profile" | "academic" | "roles">("staff");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New staff form state
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("Password@123");
  const [newRole, setNewRole] = useState("ADMISSION_COUNSELLOR");
  const [savingStaff, setSavingStaff] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  async function loadStaff() {
    try {
      setLoadingStaff(true);
      const res = await fetch("/api/staff");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setStaffList(json.data);
      }
    } catch (e) {
      console.error("Failed to load staff list:", e);
    } finally {
      setLoadingStaff(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function handleCreateStaff(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSavingStaff(true);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newFullName.trim(),
          email: newEmail.trim().toLowerCase(),
          password: newPassword,
          role: newRole,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setFormError(json.error || "Failed to create staff account");
      } else {
        setFormSuccess(`Staff account for ${newFullName} created successfully!`);
        setNewFullName("");
        setNewEmail("");
        setNewPassword("Password@123");
        loadStaff();
        setTimeout(() => {
          setShowAddModal(false);
          setFormSuccess("");
        }, 1500);
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to create staff account");
    } finally {
      setSavingStaff(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Topbar title="Settings & Team Administration" subtitle="User roles, staff directory, and school admission parameters" />

      <div className="p-7 space-y-7 fade-in max-w-[1600px] mx-auto w-full">
        {/* Current User Session Bar */}
        <div className="card p-5 flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base"
              style={{
                background: user?.role === "SUPER_ADMIN"
                  ? "linear-gradient(135deg, #7C3AED, #4F46E5)"
                  : user?.role === "PRINCIPAL"
                  ? "linear-gradient(135deg, #D97706, #B45309)"
                  : "linear-gradient(135deg, #2563EB, #1D4ED8)",
              }}
            >
              {user?.fullName ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("") : "SA"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{user?.fullName || "Staff Member"}</h3>
                <span
                  className="chip text-[11px] font-bold"
                  style={{
                    background: user?.role === "SUPER_ADMIN" ? "#F5F3FF" : "#EFF6FF",
                    color: user?.role === "SUPER_ADMIN" ? "#7C3AED" : "var(--blue-700)",
                    borderColor: user?.role === "SUPER_ADMIN" ? "#DDD6FE" : "#BFDBFE",
                  }}
                >
                  {user?.role === "SUPER_ADMIN"
                    ? "Super Admin"
                    : user?.role === "PRINCIPAL"
                    ? "Principal"
                    : "Admission Counsellor"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged in as <span className="font-semibold text-slate-800">{user?.email}</span> · Nalapad Academy Admissions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Auth Session
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border)] gap-6 text-sm font-bold">
          {[
            { key: "staff", label: `Staff & Team (${staffList.length})`, icon: Users },
            { key: "roles", label: "Roles & Permissions (RBAC)", icon: ShieldCheck },
            { key: "academic", label: "Academic Configuration", icon: Database },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className="flex items-center gap-2 pb-3 transition-all border-b-2 cursor-pointer focus:outline-none"
                style={{
                  color: active ? "var(--blue-700)" : "var(--text-sub)",
                  borderColor: active ? "var(--blue-700)" : "transparent",
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Staff & Team Management */}
        {activeTab === "staff" && (
          <div className="space-y-5">
            <div className="card p-0 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Nalapad Admissions Staff Roster</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized team members, assigned counsellors, and administrative accounts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadStaff}
                    disabled={loadingStaff}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    title="Refresh list"
                  >
                    <RefreshCw size={13} className={loadingStaff ? "animate-spin" : ""} /> Refresh
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Staff Account
                  </button>
                </div>
              </div>

              {loadingStaff ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Loader2 className="animate-spin mb-2" size={24} color="#1A56DB" />
                  <p className="text-xs font-semibold">Loading staff accounts...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">System Role</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Account Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffList.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                style={{
                                  background: s.role === "SUPER_ADMIN"
                                    ? "#7C3AED"
                                    : s.role === "PRINCIPAL"
                                    ? "#D97706"
                                    : "#2563EB",
                                }}
                              >
                                {s.full_name ? s.full_name[0] : "S"}
                              </div>
                              <span className="font-bold text-slate-900">{s.full_name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{s.email}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className="chip text-[11px] font-bold"
                              style={{
                                background: s.role === "SUPER_ADMIN"
                                  ? "#F5F3FF"
                                  : s.role === "PRINCIPAL"
                                  ? "#FFFBEB"
                                  : "#EFF6FF",
                                color: s.role === "SUPER_ADMIN"
                                  ? "#7C3AED"
                                  : s.role === "PRINCIPAL"
                                  ? "#B45309"
                                  : "#1D4ED8",
                                borderColor: s.role === "SUPER_ADMIN"
                                  ? "#DDD6FE"
                                  : s.role === "PRINCIPAL"
                                  ? "#FDE68A"
                                  : "#BFDBFE",
                              }}
                            >
                              {s.role === "SUPER_ADMIN"
                                ? "Super Admin"
                                : s.role === "PRINCIPAL"
                                ? "Principal"
                                : "Admission Counsellor"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-500">
                            {formatDate(s.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Roles & Permissions Matrix */}
        {activeTab === "roles" && (
          <div className="card p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Permissions Matrix</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Defines feature access and authorization boundaries across staff designations.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-3 px-4">Module / Capability</th>
                    <th className="py-3 px-4 text-center">Super Admin</th>
                    <th className="py-3 px-4 text-center">Principal / Manager</th>
                    <th className="py-3 px-4 text-center">Admission Counsellor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { feature: "Manage Staff Accounts & System Settings", sa: true, p: false, c: false },
                    { feature: "Full School Reports & Conversion Funnels", sa: true, p: true, c: false },
                    { feature: "Export Master Registers (CSV / Excel)", sa: true, p: true, c: false },
                    { feature: "Collect Registration & Admission Fees", sa: true, p: true, c: true },
                    { feature: "Issue & Print Official Payment Receipts", sa: true, p: true, c: true },
                    { feature: "Verify & Approve Admission Documents", sa: true, p: true, c: true },
                    { feature: "Schedule & Host Campus Walk-ins", sa: true, p: true, c: true },
                    { feature: "Log Calls, WhatsApp & Follow-up Tasks", sa: true, p: true, c: true },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.feature}</td>
                      <td className="py-3 px-4 text-center">
                        {row.sa ? (
                          <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={14} /> Full Access
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.p ? (
                          <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={14} /> Full Access
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.c ? (
                          <span className="text-blue-700 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={14} /> Assigned Leads
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Academic Configuration */}
        {activeTab === "academic" && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Campus & Standard Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs text-slate-500 font-medium">Campus Institution</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">Nalapad Academy</p>
                  <p className="text-xs text-slate-400">Bangalore, Karnataka</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs text-slate-500 font-medium">Active Academic Year</span>
                  <p className="text-sm font-bold text-blue-700 mt-1">AY 2025–26</p>
                  <p className="text-xs text-slate-400">Current active admission cycle</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 mt-4">
                  Enrolled Standards & Grades
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Pre-KG", "LKG", "UKG", "Grade 1", "Grade 2", "Grade 3",
                    "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8",
                    "Grade 9", "Grade 10", "Grade 11", "Grade 12"
                  ].map((grade) => (
                    <span key={grade} className="chip bg-white text-slate-800 border-slate-200 font-semibold">
                      {grade}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Staff Account */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal max-w-md">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Staff Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">Provision login credentials and designate role</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary h-8 w-8 p-0 rounded-lg">
                <X size={15} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg mb-4 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-lg mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={15} /> {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <span className="form-label">Full Name <span className="text-red-500">*</span></span>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g., Anjali Rao"
                  className="input-field mt-1 text-xs"
                />
              </div>

              <div>
                <span className="form-label">Staff Email <span className="text-red-500">*</span></span>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="anjali.rao@nalapad.edu"
                  className="input-field mt-1 text-xs"
                />
              </div>

              <div>
                <span className="form-label">Initial Password <span className="text-red-500">*</span></span>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field mt-1 text-xs font-mono"
                />
              </div>

              <div>
                <span className="form-label">Assign System Role <span className="text-red-500">*</span></span>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="input-field mt-1 text-xs"
                >
                  <option value="ADMISSION_COUNSELLOR">Admission Counsellor</option>
                  <option value="PRINCIPAL">Principal / Director</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStaff}
                  className="btn-primary flex-1 text-xs"
                >
                  {savingStaff ? <Loader2 size={14} className="animate-spin" /> : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
