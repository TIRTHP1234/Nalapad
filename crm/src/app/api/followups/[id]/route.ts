import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/followups/[id] — complete or reschedule a follow-up
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await req.json();

    // 1. Fetch existing follow-up
    const { data: existing, error: fetchErr } = await supabase
      .from("follow_ups")
      .select("*, enquiry:enquiries(id, student_name, enquiry_id)")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    if (typeof body.completed === "boolean") {
      updates.completed = body.completed;
      updates.completed_at = body.completed ? new Date().toISOString() : null;
    }

    if (body.followUpDate) updates.follow_up_date = body.followUpDate;
    if (body.followUpTime) updates.follow_up_time = body.followUpTime;
    if (body.notes) updates.notes = body.notes;
    if (body.type) updates.type = body.type;

    const { data: updated, error: updateErr } = await supabase
      .from("follow_ups")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact, applying_class),
        assigned_user:profiles!follow_ups_assigned_to_fkey(id, full_name)
      `)
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 2. Automatically log to activities audit trail
    if (existing.enquiry_id) {
      let activityType = "FOLLOW_UP";
      let outcome = "Follow-up updated";
      let remarks = body.notes || "";

      if (body.completed) {
        outcome = `${existing.type || "Follow-up"} marked completed`;
        remarks = body.outcomeRemarks || `Follow-up completed on ${new Date().toLocaleDateString()}`;
      } else if (body.rescheduled || (body.followUpDate && body.followUpDate !== existing.follow_up_date)) {
        outcome = `Follow-up rescheduled to ${body.followUpDate}`;
        remarks = body.notes ? `Reason: ${body.notes}` : "Follow-up rescheduled";
      }

      await supabase.from("activities").insert({
        enquiry_id: existing.enquiry_id,
        type: activityType,
        outcome: outcome,
        remarks: remarks,
        performed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/followups/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { error } = await supabase.from("follow_ups").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
