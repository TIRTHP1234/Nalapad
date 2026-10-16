import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/enquiries/[id] — get single enquiry with full relations
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("enquiries")
      .select(`
        *,
        counsellor:profiles!enquiries_counsellor_id_fkey(id, full_name, email),
        created_by_user:profiles!enquiries_created_by_fkey(id, full_name),
        activities(*),
        tasks(*),
        follow_ups(*),
        documents(*),
        registrations(*),
        admissions(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH /api/enquiries/[id] — update status or details
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await req.json();

    const updatePayload: Record<string, any> = {};

    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.counsellorId !== undefined) updatePayload.counsellor_id = body.counsellorId;
    if (body.remarks !== undefined) updatePayload.remarks = body.remarks;
    if (body.dnpReason !== undefined) updatePayload.dnp_reason = body.dnpReason;
    if (body.applyingClass !== undefined) updatePayload.applying_class = body.applyingClass;
    if (body.primaryContact !== undefined) updatePayload.primary_contact = body.primaryContact;
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.whatsapp !== undefined) updatePayload.whatsapp = body.whatsapp;
    if (body.studentName !== undefined) updatePayload.student_name = body.studentName;

    const { data, error } = await supabase
      .from("enquiries")
      .update(updatePayload)
      .eq("id", id)
      .select(`
        *,
        counsellor:profiles!enquiries_counsellor_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/enquiries/[id] — remove enquiry
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("enquiries")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
