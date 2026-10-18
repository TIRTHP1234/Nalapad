"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ClipboardCheck, 
  TrendingUp, 
  Receipt, 
  ShieldCheck 
} from "lucide-react";

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
      {/* ── Left panel (institutional brand) ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{
          flex: "0 0 460px",
          background: "linear-gradient(180deg, #18181B 0%, #100F0E 100%)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle ambient brand glow */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo & Institution Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
            style={{ 
              background: "rgba(249,115,22,0.18)", 
              border: "1px solid rgba(249,115,22,0.35)",
              color: "#F97316"
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg text-white tracking-tight">
                Nalapad Academy
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                CRM
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Admissions & Student Management System
            </p>
          </div>
        </div>

        {/* Feature list with professional icons */}
        <div className="relative z-10 space-y-6 my-auto py-8">
          {[
            { 
              icon: ClipboardCheck, 
              title: "End-to-end Admission Tracking", 
              desc: "From initial lead ingestion, follow-ups, and tours to verified enrollment." 
            },
            { 
              icon: TrendingUp, 
              title: "Real-time Intelligence & Funnel", 
              desc: "Live conversion analytics, drop-off signals, and counsellor performance tracking." 
            },
            { 
              icon: Receipt, 
              title: "Fee Collection & Digital Receipts", 
              desc: "Instant GST-compliant voucher generation and verified financial ledger logs." 
            },
            { 
              icon: ShieldCheck, 
              title: "Multi-Role Access Control (RBAC)", 
              desc: "Fine-grained permissions for Super Admin, Principal, and Admission Counsellors." 
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-start gap-3.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "#F97316"
                  }}
                >
                  <Icon size={17} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white tracking-tight">{f.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-500">
          <span>© 2025–26 Nalapad Academy</span>
          <span>v2.4 Enterprise</span>
        </div>
      </div>

      {/* ── Right panel (login form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600 border border-orange-200">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="font-heading font-extrabold text-base text-slate-900">
                Nalapad Academy CRM
              </p>
              <p className="text-xs text-slate-500">Admissions Staff Portal</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
              Staff Portal Sign In
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back. Enter your institutional credentials to access admissions workflows.
            </p>
          </div>

          {/* Quick Staff Role Switcher */}
          <div className="mb-6 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                <Sparkles size={12} className="text-orange-500" /> Demo 1-Click Access
              </span>
              <span className="text-[11px] text-slate-400">Select any role to test</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: "Super Admin", name: "Tirth Patel", email: "admin@nalapad.edu" },
                { role: "Principal", name: "Dr. K. Nalapad", email: "principal@nalapad.edu" },
                { role: "Senior Counsellor", name: "Priya Sharma", email: "priya.sharma@nalapad.edu" },
                { role: "Counsellor", name: "Arun Patel", email: "arun.patel@nalapad.edu" },
              ].map((r) => (
                <button
                  key={r.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(r.email, "Password@123")}
                  className="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50/40 transition-all text-xs cursor-pointer group shadow-2xs"
                >
                  <span className="font-semibold text-slate-900 group-hover:text-orange-600 block transition-colors">
                    {r.role}
                  </span>
                  <span className="text-[11px] text-slate-500">{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="form-label">
                Institutional Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="name@nalapad.edu"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center h-11 text-sm font-semibold mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In to Staff Portal"
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-orange-500" /> Encrypted Session • Authorized Nalapad Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

