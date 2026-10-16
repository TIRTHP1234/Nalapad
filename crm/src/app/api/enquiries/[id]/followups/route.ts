import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/enquiries/[id]/followups
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("follow_ups")
      .select(`
        *,
        assignee:profiles!follow_ups_assigned_to_fkey(id, full_name)
      `)
      .eq("enquiry_id", id)
      .order("follow_up_date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/enquiries/[id]/followups — schedule a follow-up
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from("follow_ups")
      .insert({
        enquiry_id: id,
        follow_up_date: body.followUpDate,
        follow_up_time: body.followUpTime || "10:00:00",
        type: body.type || "CALL",
        assigned_to: body.assignedTo || null,
        reminder: body.reminder ?? true,
        notes: body.notes || null,
        completed: false,
        created_by: body.createdBy || null,
      })
      .select(`
        *,
        assignee:profiles!follow_ups_assigned_to_fkey(id, full_name)
      `)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Also update lead status to FOLLOW_UP if currently NEW
    await supabase
      .from("enquiries")
      .update({ status: "FOLLOW_UP", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "NEW");

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
