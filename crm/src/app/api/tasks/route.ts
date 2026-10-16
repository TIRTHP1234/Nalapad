import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact),
        assigned_user:profiles!tasks_assigned_to_fkey(id, full_name)
      `)
      .order("due_datetime", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/tasks — create a task
export async function POST(req: Request) {
  try {
    const supabase = await createAdminClient();
    const body = await req.json();

    if (!body.enquiryId || !body.description) {
      return NextResponse.json({ error: "Enquiry ID and description are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        enquiry_id: body.enquiryId,
        description: body.description,
        priority: body.priority || "MEDIUM",
        due_datetime: body.dueDatetime || new Date().toISOString(),
        assigned_to: body.assignedTo || null,
        status: "OPEN",
      })
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact),
        assigned_user:profiles!tasks_assigned_to_fkey(id, full_name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto log activity
    await supabase.from("activities").insert({
      enquiry_id: body.enquiryId,
      type: "NOTE",
      outcome: `New task assigned: "${body.description}"`,
      remarks: `Priority: ${body.priority || "MEDIUM"}`,
      performed_at: new Date().toISOString(),
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

