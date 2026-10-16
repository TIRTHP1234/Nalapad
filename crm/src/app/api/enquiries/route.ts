import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/enquiries — list with filters
export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { searchParams } = new URL(req.url);

    const status      = searchParams.get("status");
    const source      = searchParams.get("source");
    const classFilter = searchParams.get("class");
    const search      = searchParams.get("search");
    const counsellor  = searchParams.get("counsellor");

    let query = supabase
      .from("enquiries")
      .select(`
        *,
        counsellor:profiles!enquiries_counsellor_id_fkey(id, full_name, email),
        created_by_user:profiles!enquiries_created_by_fkey(id, full_name)
      `)
      .order("created_at", { ascending: false });

    if (status && status !== "ALL")      query = query.eq("status", status);
    if (source && source !== "ALL")      query = query.eq("lead_source", source);
    if (classFilter && classFilter !== "ALL") query = query.eq("applying_class", classFilter);
    if (counsellor)                      query = query.eq("counsellor_id", counsellor);
    if (search) {
      query = query.or(
        `student_name.ilike.%${search}%,enquiry_id.ilike.%${search}%,primary_contact.ilike.%${search}%,father_name.ilike.%${search}%,mother_name.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/enquiries — create new enquiry
export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await req.json();

    // Generate enquiry ID
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from("enquiries")
      .select("*", { count: "exact", head: true });
    const num = String((count || 0) + 1).padStart(4, "0");
    const enquiryId = `ENQ-${year}-${num}`;

    const { data, error } = await supabase
      .from("enquiries")
      .insert({
        enquiry_id:       enquiryId,
        enquiry_date:     body.enquiryDate || new Date().toISOString().split("T")[0],
        student_name:     body.studentName,
        student_dob:      body.studentDOB || null,
        student_gender:   body.studentGender ? body.studentGender.toUpperCase() : null,
        current_school:   body.currentSchool || null,
        father_name:      body.fatherName || null,
        mother_name:      body.motherName || null,
        primary_contact:  body.primaryContact,
        secondary_contact:body.secondaryContact || null,
        email:            body.email || null,
        whatsapp:         body.whatsapp || null,
        area:             body.area || null,
        city:             body.city || null,
        pincode:          body.pincode || null,
        campus:           body.campus || "Main Campus",
        applying_class:   body.applyingClass,
        academic_year:    body.academicYear || "2025-26",
        has_sibling:      body.hasSibling || false,
        sibling_name:     body.siblingName || null,
        sibling_class:    body.siblingClass || null,
        lead_source:      body.leadSource ? body.leadSource.toUpperCase() : "OTHER",
        campaign:         body.campaign || null,
        counsellor_id:    body.counsellorId || null,
        remarks:          body.remarks || null,
        created_by:       body.createdBy || null,
        status:           "NEW",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
