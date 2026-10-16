"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { leadSourceLabels, classes } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Save, User, Users, GraduationCap, Tag, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { icon: User,           title: "Student Details",    desc: "Candidate name, DOB & gender" },
  { icon: Users,          title: "Parent & Contact",   desc: "Contact numbers & address" },
  { icon: GraduationCap,  title: "Admission Info",     desc: "Grade, year & sibling" },
  { icon: Tag,            title: "Lead & Assignment",  desc: "Source channel & counsellor" },
];

const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div className="space-y-1.5">
    <span className="form-label">
      {label}{required && <span className="text-red-600 font-bold"> *</span>}
    </span>
    {children}
  </div>
);

export default function NewEnquiryPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    studentName: "", studentDOB: "", studentGender: "", currentSchool: "",
    fatherName: "", motherName: "", primaryContact: "", whatsapp: "",
    email: "", area: "", city: "", pincode: "",
    applyingClass: "", academicYear: "2025-26",
    hasSibling: false, siblingName: "", siblingClass: "",
    leadSource: "", campaign: "", counsellorId: "", remarks: "",
  });

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [counsellors, setCounsellors] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadCounsellors() {
      try {
        const res = await fetch("/api/counsellors");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setCounsellors(json.data.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.email,
          })));
        }
      } catch (e) {
        console.error("Failed to load counsellors:", e);
      }
    }
    loadCounsellors();
  }, []);

  function validateStep(s: number): boolean {
    if (s === 0) {
      if (!form.studentName.trim()) { setError("Student name is required"); return false; }
      if (!form.studentGender) { setError("Student gender is required"); return false; }
    }
    if (s === 1) {
      if (!form.primaryContact.trim()) { setError("Primary contact phone number is required"); return false; }
    }
    if (s === 2) {
      if (!form.applyingClass) { setError("Applying class is required"); return false; }
    }
    if (s === 3) {
      if (!form.leadSource) { setError("Lead source is required"); return false; }
    }
    setError("");
    return true;
  }

  async function handleSubmit() {
    if (!validateStep(3)) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save enquiry");
      }
      router.push(`/enquiries/${json.data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create enquiry. Ensure database connection is active.");
      setLoading(false);
    }
  }


  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <Topbar title="New Admission Enquiry" subtitle="Register a new prospective student into Nalapad CRM" />

      <div className="p-7 max-w-4xl mx-auto fade-in">
        <Link href="/enquiries" className="btn-secondary inline-flex mb-6 text-xs" style={{ padding: "8px 14px", minHeight: "36px" }}>
          <ChevronLeft size={15} /> Back to Enquiries
        </Link>

        {/* ── STEP PROGRESS BAR ── */}
        <div className="card mb-6 p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              const StepIcon = s.icon;
              return (
                <div key={i} className="flex items-center flex-1">
                  <div
                    onClick={() => i <= step && setStep(i)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all"
                      style={{
                        background: done ? "#047857" : active ? "var(--blue-700)" : "#EEF2F7",
                        color: done || active ? "#FFFFFF" : "var(--text-sub)",
                        boxShadow: active ? "0 4px 12px rgba(26,86,219,0.30)" : "none",
                      }}
                    >
                      {done ? <CheckCircle2 size={18} /> : <StepIcon size={18} />}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-bold leading-tight" style={{ color: active ? "var(--blue-700)" : done ? "#047857" : "var(--text-h)" }}>
                        {s.title}
                      </p>
                      <p className="text-[11px] font-500 mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Step {i + 1}
                      </p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-4 h-0.5 hidden md:block"
                      style={{ background: done ? "#047857" : "#E2E8F0" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FORM CONTAINER ── */}
        <div className="card p-8">
          <div className="mb-7 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-xl font-extrabold" style={{ color: "var(--text-h)", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.015em" }}>
              Step {step + 1}: {STEPS[step].title}
            </h3>
            <p className="text-xs font-500 mt-1" style={{ color: "var(--text-sub)" }}>{STEPS[step].desc}</p>
          </div>

          {/* ── Step 0: Student Details ── */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name of Student" required>
                  <input
                    className="input-field"
                    placeholder="e.g., Aarav Mehta"
                    value={form.studentName}
                    onChange={e => set("studentName", e.target.value)}
                  />
                </Field>
                <Field label="Gender" required>
                  <select
                    className="input-field"
                    value={form.studentGender}
                    onChange={e => set("studentGender", e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Date of Birth">
                  <input
                    type="date"
                    className="input-field"
                    value={form.studentDOB}
                    onChange={e => set("studentDOB", e.target.value)}
                  />
                </Field>
                <Field label="Current / Previous School">
                  <input
                    className="input-field"
                    placeholder="e.g., National Public School"
                    value={form.currentSchool}
                    onChange={e => set("currentSchool", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 1: Parent & Contact ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Father's Full Name">
                  <input
                    className="input-field"
                    placeholder="e.g., Rajesh Mehta"
                    value={form.fatherName}
                    onChange={e => set("fatherName", e.target.value)}
                  />
                </Field>
                <Field label="Mother's Full Name">
                  <input
                    className="input-field"
                    placeholder="e.g., Sunita Mehta"
                    value={form.motherName}
                    onChange={e => set("motherName", e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Primary Mobile Phone" required>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+91 98765 43210"
                    value={form.primaryContact}
                    onChange={e => set("primaryContact", e.target.value)}
                  />
                </Field>
                <Field label="WhatsApp Number">
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+91 98765 43210"
                    value={form.whatsapp}
                    onChange={e => set("whatsapp", e.target.value)}
                  />
                </Field>
                <Field label="Parent Email Address">
                  <input
                    type="email"
                    className="input-field"
                    placeholder="parent@example.com"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Residential Area / Locality">
                  <input
                    className="input-field"
                    placeholder="e.g., Indiranagar"
                    value={form.area}
                    onChange={e => set("area", e.target.value)}
                  />
                </Field>
                <Field label="City">
                  <input
                    className="input-field"
                    placeholder="e.g., Bengaluru"
                    value={form.city}
                    onChange={e => set("city", e.target.value)}
                  />
                </Field>
                <Field label="Pincode">
                  <input
                    className="input-field"
                    placeholder="560038"
                    value={form.pincode}
                    onChange={e => set("pincode", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 2: Admission Info ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Target Class / Grade" required>
                  <select
                    className="input-field"
                    value={form.applyingClass}
                    onChange={e => set("applyingClass", e.target.value)}
                  >
                    <option value="">Select Applying Class</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Academic Year" required>
                  <select
                    className="input-field"
                    value={form.academicYear}
                    onChange={e => set("academicYear", e.target.value)}
                  >
                    <option value="2025-26">AY 2025–26</option>
                    <option value="2026-27">AY 2026–27</option>
                  </select>
                </Field>
              </div>

              {/* Sibling Box */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[#F8FAFD] space-y-4">
                <div
                  className="flex items-center gap-3 cursor-pointer select-none"
                  onClick={() => set("hasSibling", !form.hasSibling)}
                >
                  <input
                    type="checkbox"
                    id="hasSiblingCheck"
                    checked={form.hasSibling}
                    onChange={e => set("hasSibling", e.target.checked)}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-[var(--text-h)] cursor-pointer select-none">
                    Does this candidate have a sibling currently studying at Nalapad?
                  </span>
                </div>

                {form.hasSibling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-[var(--border)]">
                    <Field label="Sibling's Full Name">
                      <input
                        className="input-field"
                        placeholder="Sibling's name"
                        value={form.siblingName}
                        onChange={e => set("siblingName", e.target.value)}
                      />
                    </Field>
                    <Field label="Sibling's Current Grade">
                      <select
                        className="input-field"
                        value={form.siblingClass}
                        onChange={e => set("siblingClass", e.target.value)}
                      >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Lead & Counsellor ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Lead Acquisition Source" required>
                  <select
                    className="input-field"
                    value={form.leadSource}
                    onChange={e => set("leadSource", e.target.value)}
                  >
                    <option value="">Select Origin Source</option>
                    {Object.entries(leadSourceLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Marketing Campaign / Tag">
                  <input
                    className="input-field"
                    placeholder="e.g., Google Search Ads, Open House 2025"
                    value={form.campaign}
                    onChange={e => set("campaign", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Assign Admission Counsellor">
                <select
                  className="input-field"
                  value={form.counsellorId}
                  onChange={e => set("counsellorId", e.target.value)}
                >
                  <option value="">Select Counsellor (Optional - Unassigned)</option>
                  {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>

              <Field label="Initial Counselling Notes / Remarks">
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Record parent queries, preferred curriculum, transportation requirements, or special notes..."
                  value={form.remarks}
                  onChange={e => set("remarks", e.target.value)}
                />
              </Field>
            </div>
          )}

          {error && (
            <div className="p-4 mt-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <span className="font-bold">Notice:</span> {error}
            </div>
          )}

          {/* ── FOOTER NAVIGATION BAR ── */}
          <div className="flex items-center justify-between mt-9 pt-6 border-t border-[var(--border)]">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setError("");
                step > 0 ? setStep(s => s - 1) : router.push("/enquiries");
              }}
              className="btn-secondary"
            >
              <ChevronLeft size={16} /> {step === 0 ? "Cancel & Return" : "Previous Step"}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (validateStep(step)) setStep(s => s + 1);
                }}
                className="btn-primary"
              >
                Continue to Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="btn-primary"
                style={{ background: "#047857" }}
              >
                <Save size={16} /> {loading ? "Saving to Database..." : "Complete & Create Enquiry"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
