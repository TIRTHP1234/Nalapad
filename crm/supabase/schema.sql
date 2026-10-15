-- =====================================================
-- NALAPAD CRM — SUPABASE DATABASE SCHEMA
-- Run this entire script in: Supabase → SQL Editor → New Query
-- =====================================================

-- ── Enable UUID extension ──
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES (extends Supabase auth.users) ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'ADMISSION_COUNSELLOR'
                  CHECK (role IN ('SUPER_ADMIN','ADMISSION_MANAGER','ADMISSION_COUNSELLOR','PRINCIPAL')),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ENQUIRIES (main lead table) ──
CREATE TABLE IF NOT EXISTS public.enquiries (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id          TEXT NOT NULL UNIQUE, -- ENQ-2025-0001
  enquiry_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Student
  student_name        TEXT NOT NULL,
  student_dob         DATE,
  student_gender      TEXT CHECK (student_gender IN ('MALE','FEMALE','OTHER')),
  current_school      TEXT,
  -- Parent/Contact
  father_name         TEXT,
  mother_name         TEXT,
  primary_contact     TEXT NOT NULL,
  secondary_contact   TEXT,
  email               TEXT,
  whatsapp            TEXT,
  -- Address
  address             TEXT,
  area                TEXT,
  city                TEXT,
  pincode             TEXT,
  -- Admission
  campus              TEXT NOT NULL DEFAULT 'Main Campus',
  applying_class      TEXT NOT NULL,
  academic_year       TEXT NOT NULL DEFAULT '2025-26',
  -- Sibling
  has_sibling         BOOLEAN NOT NULL DEFAULT FALSE,
  sibling_name        TEXT,
  sibling_class       TEXT,
  -- Lead
  lead_source         TEXT NOT NULL
                        CHECK (lead_source IN ('WEBSITE','GOOGLE_ADS','META','PHONE_CALL',
                               'WHATSAPP','WALK_IN','PARENT_REFERRAL','STAFF_REFERRAL',
                               'SCHOOL_EVENT','OTHER')),
  campaign            TEXT,
  counsellor_id       UUID REFERENCES public.profiles(id),
  -- Status
  status              TEXT NOT NULL DEFAULT 'NEW'
                        CHECK (status IN ('NEW','FOLLOW_UP','WALK_IN_SCHEDULED','WALK_IN_DONE',
                               'REGISTRATION_PENDING','REGISTRATION_PAID','ADMISSION_PENDING',
                               'ADMISSION_CONFIRMED','ADMISSION_CANCELLED','DNP')),
  dnp_reason          TEXT,
  remarks             TEXT,
  -- Timestamps
  created_by          UUID REFERENCES public.profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ACTIVITIES ──
CREATE TABLE IF NOT EXISTS public.activities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id    UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  type          TEXT NOT NULL
                  CHECK (type IN ('PHONE_CALL','WHATSAPP','EMAIL','MEETING','WALK_IN',
                         'FOLLOW_UP','NOTE','DOCUMENT_COLLECTION','PAYMENT_FOLLOW_UP',
                         'ADMISSION_CONFIRMATION')),
  outcome       TEXT NOT NULL,
  remarks       TEXT,
  next_action   TEXT,
  performed_by  UUID REFERENCES public.profiles(id),
  performed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TASKS ──
CREATE TABLE IF NOT EXISTS public.tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id      UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  assigned_to     UUID REFERENCES public.profiles(id),
  priority        TEXT NOT NULL DEFAULT 'MEDIUM'
                    CHECK (priority IN ('HIGH','MEDIUM','LOW')),
  due_datetime    TIMESTAMPTZ NOT NULL,
  description     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN','IN_PROGRESS','COMPLETED','CANCELLED')),
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── FOLLOW-UPS ──
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id      UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  follow_up_date  DATE NOT NULL,
  follow_up_time  TIME NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('CALL','WHATSAPP','EMAIL','VISIT')),
  assigned_to     UUID REFERENCES public.profiles(id),
  reminder        BOOLEAN NOT NULL DEFAULT TRUE,
  notes           TEXT,
  completed       BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── WALK-INS ──
CREATE TABLE IF NOT EXISTS public.walk_ins (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id      UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  visit_date      TIMESTAMPTZ NOT NULL,
  visitor_name    TEXT NOT NULL,
  counsellor_id   UUID REFERENCES public.profiles(id),
  outcome         TEXT CHECK (outcome IN ('INTERESTED','NEEDS_FOLLOW_UP','NOT_INTERESTED','REGISTRATION')),
  remarks         TEXT,
  next_action     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── REGISTRATIONS ──
CREATE TABLE IF NOT EXISTS public.registrations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id            UUID NOT NULL UNIQUE REFERENCES public.enquiries(id) ON DELETE CASCADE,
  amount                NUMERIC(10,2) NOT NULL,
  payment_date          DATE NOT NULL,
  payment_mode          TEXT NOT NULL CHECK (payment_mode IN ('CASH','CHEQUE','ONLINE','UPI','DD')),
  transaction_reference TEXT,
  receipt_number        TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'PAID' CHECK (status IN ('PAID','REFUNDED')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ADMISSIONS ──
CREATE TABLE IF NOT EXISTS public.admissions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id            UUID NOT NULL UNIQUE REFERENCES public.enquiries(id) ON DELETE CASCADE,
  admission_date        DATE,
  fee_amount            NUMERIC(10,2),
  amount_paid           NUMERIC(10,2) DEFAULT 0,
  payment_date          DATE,
  payment_mode          TEXT CHECK (payment_mode IN ('CASH','CHEQUE','ONLINE','UPI','DD')),
  transaction_reference TEXT,
  receipt_number        TEXT,
  status                TEXT NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING','CONFIRMED','CANCELLED')),
  cancellation_reason   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── DOCUMENTS ──
CREATE TABLE IF NOT EXISTS public.documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id    UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','SUBMITTED','VERIFIED')),
  remarks       TEXT,
  file_url      TEXT,
  uploaded_at   TIMESTAMPTZ,
  verified_by   UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walk_ins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents   ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all data
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read enquiries"
  ON public.enquiries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert enquiries"
  ON public.enquiries FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update enquiries"
  ON public.enquiries FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read activities"
  ON public.activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert activities"
  ON public.activities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read tasks"
  ON public.tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tasks"
  ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
  ON public.tasks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read follow_ups"
  ON public.follow_ups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert follow_ups"
  ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update follow_ups"
  ON public.follow_ups FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read walk_ins"
  ON public.walk_ins FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert walk_ins"
  ON public.walk_ins FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read registrations"
  ON public.registrations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert registrations"
  ON public.registrations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read admissions"
  ON public.admissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage admissions"
  ON public.admissions FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read documents"
  ON public.documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage documents"
  ON public.documents FOR ALL TO authenticated USING (true);

-- =====================================================
-- TRIGGERS — auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_admissions_updated_at
  BEFORE UPDATE ON public.admissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- FUNCTION — auto-create profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'ADMISSION_COUNSELLOR')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED: Create initial admin user profile
-- (Run AFTER creating the admin user via Supabase Auth)
-- =====================================================
-- UPDATE public.profiles SET role = 'SUPER_ADMIN' WHERE email = 'admin@nalapad.edu';
