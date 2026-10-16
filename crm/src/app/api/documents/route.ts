import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const STANDARD_DOCUMENTS = [
  "Birth Certificate",
  "Transfer Certificate (TC)",
  "Previous School Mark Sheet / Report Card",
  "Student Aadhaar Card",
  "Parent / Guardian Aadhaar Card",
  "Passport-size Photographs",
  "Address Proof",
  "Medical Fitness Certificate",
];

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { searchParams } = new URL(req.url);
    const enquiryId = searchParams.get("enquiryId");
    const statusFilter = searchParams.get("status");

    if (enquiryId) {
      // 1. Fetch existing documents for this specific enquiry
      let { data: existing, error } = await supabase
        .from("documents")
        .select("*")
        .eq("enquiry_id", enquiryId)
        .order("created_at", { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // If no checklist exists yet, auto-seed the standard required documents
      if (!existing || existing.length === 0) {
        const seedPayload = STANDARD_DOCUMENTS.map((name) => ({
          enquiry_id: enquiryId,
          name,
          status: "PENDING",
        }));

        const { data: seeded, error: seedErr } = await supabase
          .from("documents")
          .insert(seedPayload)
          .select();

        if (seedErr) {
          console.error("Failed to seed standard documents:", seedErr);
        } else if (seeded) {
          existing = seeded;
        }
      }

      return NextResponse.json({ data: existing || [] });
    }

    // 2. School-wide documents query for /documents desk
    // Auto-seed documents for candidates in registration/admission stages if missing
    const { data: activeEnquiries } = await supabase
      .from("enquiries")
      .select("id")
      .in("status", ["REGISTRATION_PAID", "ADMISSION_PENDING", "ADMISSION_CONFIRMED"]);

    if (activeEnquiries && activeEnquiries.length > 0) {
      const activeIds = activeEnquiries.map((e) => e.id);
      const { data: existingDocs } = await supabase
        .from("documents")
        .select("enquiry_id")
        .in("enquiry_id", activeIds);

      const existingSet = new Set((existingDocs || []).map((d) => d.enquiry_id));
      const needsSeed = activeIds.filter((id) => !existingSet.has(id));

      if (needsSeed.length > 0) {
        const seedRows = needsSeed.flatMap((enqId) =>
          STANDARD_DOCUMENTS.map((name) => ({
            enquiry_id: enqId,
            name,
            status: "PENDING",
          }))
        );
        await supabase.from("documents").insert(seedRows);
      }
    }

    let query = supabase
      .from("documents")
      .select(`
        id,
        enquiry_id,
        name,
        status,
        remarks,
        file_url,
        uploaded_at,
        created_at,
        updated_at,
        enquiries!inner (
          id,
          enquiry_id,
          student_name,
          applying_class,
          academic_year,
          primary_contact,
          status
        )
      `)
      .order("updated_at", { ascending: false });

    if (statusFilter && ["PENDING", "SUBMITTED", "VERIFIED"].includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
