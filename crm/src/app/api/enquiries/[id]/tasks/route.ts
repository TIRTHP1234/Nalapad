import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/enquiries/[id]/tasks
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(id, full_name)
      `)
      .eq("enquiry_id", id)
      .order("due_datetime", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/enquiries/[id]/tasks
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        enquiry_id: id,
        description: body.description,
        priority: body.priority || "MEDIUM",
        due_datetime: body.dueDatetime,
        assigned_to: body.assignedTo || null,
        created_by: body.createdBy || null,
        status: "OPEN",
      })
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(id, full_name)
      `)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
