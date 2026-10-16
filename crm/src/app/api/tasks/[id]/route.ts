import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/tasks/[id] — update task status or details
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await req.json();

    const { data: existing, error: fetchErr } = await supabase
      .from("tasks")
      .select("*, enquiry:enquiries(id, student_name, enquiry_id)")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status) updates.status = body.status;
    if (body.description) updates.description = body.description;
    if (body.priority) updates.priority = body.priority;
    if (body.dueDatetime) updates.due_datetime = body.dueDatetime;
    if (body.assignedTo !== undefined) updates.assigned_to = body.assignedTo;

    const { data: updated, error: updateErr } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact),
        assigned_user:profiles!tasks_assigned_to_fkey(id, full_name)
      `)
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Auto-log to activities if linked to enquiry
    if (existing.enquiry_id && body.status && body.status !== existing.status) {
      let outcome = `Task status updated to ${body.status}`;
      if (body.status === "COMPLETED") outcome = `Task completed: "${existing.description}"`;
      if (body.status === "CANCELLED") outcome = `Task cancelled: "${existing.description}"`;

      await supabase.from("activities").insert({
        enquiry_id: existing.enquiry_id,
        type: "NOTE",
        outcome: outcome,
        remarks: `Updated from ${existing.status} to ${body.status}`,
        performed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
