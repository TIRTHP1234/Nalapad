import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/walkins/[id] — update walk-in outcome
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await req.json();

    const { data: existing, error: fetchErr } = await supabase
      .from("walk_ins")
      .select("*, enquiry:enquiries(id, student_name)")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Walk-in record not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    if (body.outcome) updates.outcome = body.outcome;
    if (body.remarks) updates.remarks = body.remarks;
    if (body.nextAction) updates.next_action = body.nextAction;
    if (body.counsellorId) updates.counsellor_id = body.counsellorId;

    const { data: updated, error: updateErr } = await supabase
      .from("walk_ins")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact, applying_class, status),
        counsellor:profiles!walk_ins_counsellor_id_fkey(id, full_name)
      `)
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Update enquiry status to WALK_IN_DONE if outcome provided
    if (body.outcome && existing.enquiry_id) {
      await supabase
        .from("enquiries")
        .update({ status: "WALK_IN_DONE", updated_at: new Date().toISOString() })
        .eq("id", existing.enquiry_id);

      // Log to activity
      await supabase.from("activities").insert({
        enquiry_id: existing.enquiry_id,
        type: "WALK_IN",
        outcome: `Walk-in outcome recorded: ${body.outcome}`,
        remarks: body.remarks || null,
        next_action: body.nextAction || null,
        performed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/walkins/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { error } = await supabase.from("walk_ins").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
