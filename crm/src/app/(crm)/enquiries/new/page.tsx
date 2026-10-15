"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { leadSourceLabels, classes, mockCounsellors } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Save, User, Users, GraduationCap, Tag, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { icon: User,           title: "Student Details",    desc: "Name, DOB, gender" },
  { icon: Users,          title: "Parent & Contact",   desc: "Names, phone, address" },
  { icon: GraduationCap,  title: "Admission Info",     desc: "Class, year, sibling" },
  { icon: Tag,            title: "Lead & Assignment",  desc: "Source, campaign, counsellor" },
];

export default function NewEnquiryPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    studentName: "", studentDOB: "", studentGender: "",
    fatherName: "", motherName: "", primaryContact: "", whatsapp: "",
    email: "", area: "", city: "", pincode: "",
    applyingClass: "", academicYear: "2025-26",
    hasSibling: false, siblingName: "", siblingClass: "",
    leadSource: "", campaign: "", counsellorId: "", remarks: "",
  });

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <div>
      <label style={{ color: "var(--text-sub)", fontSize: 13, fontWeight: 600 }}>
        {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <Topbar title="New Enquiry" subtitle="Create a new admission enquiry" />

      <div className="p-6 max-w-2xl mx-auto fade-in">
        <Link href="/enquiries" className="btn-secondary inline-flex mb-5">
          <ChevronLeft size={15} /> Back to Enquiries
        </Link>

        {/* ── Step progress ── */}
        <div className="card mb-5" style={{ padding: "20px 24px" }}>
          <div className="flex items-start">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              const StepIcon = s.icon;
              return (
                <div key={i} className="flex items-start flex-1">
                  <div className="flex flex-col items-center" style={{ flex: 1 }}>
                    <button
                      onClick={() => i <= step && setStep(i)}
                      style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: done ? "#047857" : active ? "var(--blue-700)" : "#EEF2F7",
                        border: `2px solid ${done ? "#047857" : active ? "var(--blue-700)" : "#D8E0EB"}`,
                        color: done || active ? "#fff" : "var(--text-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: i <= step ? "pointer" : "default",
                        transition: "all 0.2s",
                      }}>
                      {done ? <CheckCircle2 size={18} /> : <StepIcon size={16} />}
                    </button>
                    <p className="text-center mt-2 leading-tight font-600"
                      style={{ fontSize: 12, color: active ? "var(--blue-700)" : done ? "#047857" : "var(--text-muted)", maxWidth: 72 }}>
                      {s.title}
                    </p>
                    <p className="text-center leading-tight hidden md:block"
                      style={{ fontSize: 10.5, color: "var(--text-muted)", maxWidth: 72 }}>
                      {s.desc}
                    </p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ height: 2, flex: "0 0 24px", marginTop: 19, background: done ? "#047857" : "#D8E0EB", transition: "background 0.2s" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="card" style={{ padding: "28px 30px" }}>
          {/* Step title */}
          <div className="mb-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-h)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Step {step + 1}: {STEPS[step].title}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-sub)" }}>{STEPS[step].desc}</p>
          </div>

          {/* ── Step 0: Student ── */}
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Student Full Name" required>
                <input className="input-field mt-1" placeholder="e.g., Aarav Mehta"
                  value={form.studentName} onChange={e => set("studentName", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date of Birth">
                  <input type="date" className="input-field mt-1"
                    value={form.studentDOB} onChange={e => set("studentDOB", e.target.value)} />
                </Field>
                <Field label="Gender">
                  <select className="input-field mt-1" value={form.studentGender}
                    onChange={e => set("studentGender", e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 1: Parent ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Father's Name">
                  <input className="input-field mt-1" placeholder="Father's full name"
                    value={form.fatherName} onChange={e => set("fatherName", e.target.value)} />
                </Field>
                <Field label="Mother's Name">
                  <input className="input-field mt-1" placeholder="Mother's full name"
                    value={form.motherName} onChange={e => set("motherName", e.target.value)} />
                </Field>
                <Field label="Primary Mobile" required>
                  <input className="input-field mt-1" placeholder="+91 XXXXX XXXXX"
                    value={form.primaryContact} onChange={e => set("primaryContact", e.target.value)} />
                </Field>
                <Field label="WhatsApp Number">
                  <input className="input-field mt-1" placeholder="If different from mobile"
                    value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} />
                </Field>
              </div>
              <Field label="Email Address">
                <input type="email" className="input-field mt-1" placeholder="parent@email.com"
                  value={form.email} onChange={e => set("email", e.target.value)} />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Area / Locality">
                  <input className="input-field mt-1" placeholder="e.g., Indiranagar"
                    value={form.area} onChange={e => set("area", e.target.value)} />
                </Field>
                <Field label="City">
                  <input className="input-field mt-1" placeholder="Bengaluru"
                    value={form.city} onChange={e => set("city", e.target.value)} />
                </Field>
                <Field label="Pincode">
                  <input className="input-field mt-1" placeholder="560001"
                    value={form.pincode} onChange={e => set("pincode", e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 2: Admission ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Applying for Class" required>
                  <select className="input-field mt-1" value={form.applyingClass}
                    onChange={e => set("applyingClass", e.target.value)}>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Academic Year" required>
                  <select className="input-field mt-1" value={form.academicYear}
                    onChange={e => set("academicYear", e.target.value)}>
                    <option value="2025-26">2025–26</option>
                    <option value="2026-27">2026–27</option>
                  </select>
                </Field>
              </div>
              {/* Sibling */}
              <div className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: "#F5F8FC", border: "1.5px solid var(--border)" }}>
                <input type="checkbox" id="sib" checked={form.hasSibling}
                  onChange={e => set("hasSibling", e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: "var(--blue-700)", cursor: "pointer" }} />
                <div>
                  <label htmlFor="sib" style={{ cursor: "pointer", marginBottom: 0, fontSize: 14, color: "var(--text-h)", fontWeight: 700 }}>
                    Student has a sibling already enrolled at Nalapad
                  </label>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-sub)" }}>
                    Tick this if a brother or sister is currently studying here
                  </p>
                </div>
              </div>
              {form.hasSibling && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Sibling's Name">
                    <input className="input-field mt-1" placeholder="Sibling full name"
                      value={form.siblingName} onChange={e => set("siblingName", e.target.value)} />
                  </Field>
                  <Field label="Sibling's Current Class">
                    <select className="input-field mt-1" value={form.siblingClass}
                      onChange={e => set("siblingClass", e.target.value)}>
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Lead ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Lead Source" required>
                  <select className="input-field mt-1" value={form.leadSource}
                    onChange={e => set("leadSource", e.target.value)}>
                    <option value="">Select Source</option>
                    {Object.entries(leadSourceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Campaign">
                  <input className="input-field mt-1" placeholder="e.g., Diwali Campaign 2025"
                    value={form.campaign} onChange={e => set("campaign", e.target.value)} />
                </Field>
              </div>
              <Field label="Assign Counsellor">
                <select className="input-field mt-1" value={form.counsellorId}
                  onChange={e => set("counsellorId", e.target.value)}>
                  <option value="">Select Counsellor</option>
                  {mockCounsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Initial Remarks / Notes">
                <textarea className="input-field mt-1" rows={4}
                  placeholder="Any initial notes about this enquiry, parent's questions, or source details..."
                  value={form.remarks} onChange={e => set("remarks", e.target.value)} />
              </Field>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex justify-between mt-8 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : router.push("/enquiries")}
              className="btn-secondary"
            >
              <ChevronLeft size={15} /> {step === 0 ? "Cancel" : "Previous"}
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary">
                Next Step <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={() => router.push("/enquiries")} className="btn-primary">
                <Save size={15} /> Create Enquiry
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
