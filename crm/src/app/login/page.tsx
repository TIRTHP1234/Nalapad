"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "Incorrect email or password. Please try again."
        : authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-page)" }}
    >
      {/* ── Left panel (brand) ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{
          flex: "0 0 420px",
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
              Nalapad
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>
              Admission CRM
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-5">
          {[
            { icon: "📋", title: "End-to-end Admission Tracking", desc: "From first enquiry to confirmed admission in one place." },
            { icon: "📊", title: "Real-time Dashboard",             desc: "Live KPIs, counsellor performance and conversion rates." },
            { icon: "🔔", title: "Smart Follow-up Engine",          desc: "Never miss a follow-up with automated reminders." },
            { icon: "👥", title: "Role-based Access",               desc: "Super Admin, Manager, Counsellor and Principal roles." },
          ].map(f => (
            <div key={f.title} className="flex items-start gap-3">
              <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{f.icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>
          © 2025–26 Nalapad School. All rights reserved.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#0E2148" }}>
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
              fontSize: 26, fontWeight: 800,
              color: "var(--text-h)", marginBottom: 6,
            }}
          >
            Welcome back 👋
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-sub)", marginBottom: 32 }}>
            Sign in to your Nalapad CRM account
          </p>

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
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-sub)", marginBottom: 6, display: "block" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 40, fontSize: 14 }}
                  placeholder="you@nalapad.edu"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-sub)", marginBottom: 6, display: "block" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
                />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 40, paddingRight: 42, fontSize: 14 }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
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
              style={{ height: 46, fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? <><Loader2 size={17} className="animate-spin" /> Signing in...</>
                : "Sign In to CRM"
              }
            </button>
          </form>

          <div
            className="mt-8 p-4 rounded-xl text-center"
            style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
          >
            <p style={{ fontSize: 12.5, color: "#1E40AF", fontWeight: 500 }}>
              🔒 Access is restricted to authorised school staff only.<br />
              Contact your admin if you need access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
