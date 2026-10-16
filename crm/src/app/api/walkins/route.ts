import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/walkins — list all campus walk-ins
export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("walk_ins")
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact, applying_class, status),
        counsellor:profiles!walk_ins_counsellor_id_fkey(id, full_name)
      `)
      .order("visit_date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/walkins — schedule or log a campus walk-in
export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await req.json();

    if (!body.enquiryId || !body.visitorName) {
      return NextResponse.json({ error: "Enquiry ID and visitor name are required" }, { status: 400 });
    }

    const isCompleted = body.completed || body.outcome;

    const { data, error } = await supabase
      .from("walk_ins")
      .insert({
        enquiry_id: body.enquiryId,
        visitor_name: body.visitorName,
        visit_date: body.visitDate || new Date().toISOString(),
        counsellor_id: body.counsellorId || null,
        outcome: body.outcome || null,
        remarks: body.remarks || null,
        next_action: body.nextAction || null,
      })
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact, applying_class, status),
        counsellor:profiles!walk_ins_counsellor_id_fkey(id, full_name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update enquiry status
    const newStatus = isCompleted ? "WALK_IN_DONE" : "WALK_IN_SCHEDULED";
    await supabase
      .from("enquiries")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", body.enquiryId);

    // Auto log to activity timeline
    await supabase.from("activities").insert({
      enquiry_id: body.enquiryId,
      type: "WALK_IN",
      outcome: isCompleted ? `Campus Walk-in completed (${body.outcome || "Interested"})` : "Campus Walk-in scheduled",
      remarks: body.remarks || `Visitor: ${body.visitorName}`,
      next_action: body.nextAction || null,
      performed_at: new Date().toISOString(),
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
