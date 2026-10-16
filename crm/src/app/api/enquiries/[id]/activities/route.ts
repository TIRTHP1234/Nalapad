import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/enquiries/[id]/activities
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        performer:profiles!activities_performed_by_fkey(id, full_name)
      `)
      .eq("enquiry_id", id)
      .order("performed_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/enquiries/[id]/activities — log new activity
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from("activities")
      .insert({
        enquiry_id: id,
        type: body.type,
        outcome: body.outcome,
        remarks: body.remarks || null,
        next_action: body.nextAction || null,
        performed_by: body.performedBy || null,
        performed_at: body.performedAt || new Date().toISOString(),
      })
      .select(`
        *,
        performer:profiles!activities_performed_by_fkey(id, full_name)
      `)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Touch enquiry updated_at
    await supabase
      .from("enquiries")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
