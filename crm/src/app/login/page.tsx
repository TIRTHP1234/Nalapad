"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e?: React.FormEvent, customEmail?: string, customPass?: string) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPass,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Incorrect email or password. Please verify your credentials."
          : authError.message
      );
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    handleLogin(undefined, roleEmail, rolePass);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-page)" }}>
      {/* ── Left panel (brand) ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{
          flex: "0 0 440px",
          background: "#0E2148",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            <GraduationCap size={22} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>
              Nalapad Academy
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>
              Admissions CRM & Student Management
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-6">
          {[
            { icon: "📋", title: "End-to-end Admission Tracking", desc: "From inquiry ingestion, follow-ups, and tours to verified enrollment." },
            { icon: "📊", title: "Real-time Intelligence & Funnel", desc: "Live drop-off analytics, source ROI, and counsellor conversion tracking." },
            { icon: "🧾", title: "Fee Collection & Digital Receipts", desc: "Instant GST-compliant voucher generation and audited financial ledgers." },
            { icon: "🔒", title: "Multi-Role Access Control (RBAC)", desc: "Fine-grained permissions for Super Admin, Principal, and Counsellors." },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3.5">
              <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{f.icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>
          © 2025–26 Nalapad Academy. All rights reserved.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#0E2148" }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text-h)" }}>
              Nalapad CRM
            </p>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: "var(--text-h)",
              marginBottom: 6,
            }}
          >
            Staff Portal Sign In 👋
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-sub)", marginBottom: 24 }}>
            Access admissions records, candidate dossiers, and team tasks
          </p>

          {/* Quick Staff Role Switcher */}
          <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-[#F8FAFD]">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-700" /> Quick Role Switcher
              </span>
              <span className="text-[10px] text-blue-700 font-semibold lowercase">1-click login</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("admin@nalapad.edu", "Password@123")}
                className="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-purple-600 hover:bg-purple-50/40 transition-all text-xs cursor-pointer group"
              >
                <span className="font-bold text-slate-900 group-hover:text-purple-700 block">Super Admin</span>
                <span className="text-[11px] text-slate-500">Tirth Patel</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("principal@nalapad.edu", "Password@123")}
                className="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-amber-600 hover:bg-amber-50/40 transition-all text-xs cursor-pointer group"
              >
                <span className="font-bold text-slate-900 group-hover:text-amber-700 block">Principal</span>
                <span className="text-[11px] text-slate-500">Dr. K. Nalapad</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("priya.sharma@nalapad.edu", "Password@123")}
                className="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-600 hover:bg-emerald-50/40 transition-all text-xs cursor-pointer group"
              >
                <span className="font-bold text-slate-900 group-hover:text-emerald-700 block">Senior Counsellor</span>
                <span className="text-[11px] text-slate-500">Priya Sharma</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("arun.patel@nalapad.edu", "Password@123")}
                className="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50/40 transition-all text-xs cursor-pointer group"
              >
                <span className="font-bold text-slate-900 group-hover:text-blue-700 block">Counsellor</span>
                <span className="text-[11px] text-slate-500">Arun Patel</span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-5"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
            >
              <AlertCircle size={17} style={{ color: "#B91C1C", flexShrink: 0 }} />
              <p style={{ fontSize: 13.5, color: "#B91C1C", fontWeight: 500 }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <span className="form-label">Email Address</span>
              <div style={{ position: "relative" }} className="mt-1">
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 40, fontSize: 14 }}
                  placeholder="name@nalapad.edu"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <span className="form-label">Password</span>
              <div style={{ position: "relative" }} className="mt-1">
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 40, paddingRight: 42, fontSize: 14 }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
              style={{ height: 46, fontSize: 15, marginTop: 8, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In to Nalapad CRM"
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl text-center" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <p style={{ fontSize: 12.5, color: "#1E40AF", fontWeight: 500 }}>
              🔒 Access is strictly reserved for authorized Nalapad staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
