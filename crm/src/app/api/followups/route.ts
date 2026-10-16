import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("follow_ups")
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact, applying_class),
        assigned_user:profiles!follow_ups_assigned_to_fkey(id, full_name)
      `)
      .order("follow_up_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/followups — schedule a follow-up directly
export async function POST(req: Request) {
  try {
    const supabase = await createAdminClient();
    const body = await req.json();

    if (!body.enquiryId || !body.followUpDate) {
      return NextResponse.json({ error: "Enquiry ID and follow-up date are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("follow_ups")
      .insert({
        enquiry_id: body.enquiryId,
        follow_up_date: body.followUpDate,
        follow_up_time: body.followUpTime || "10:00:00",
        type: body.type || "CALL",
        assigned_to: body.assignedTo || null,
        reminder: body.reminder ?? true,
        notes: body.notes || null,
        completed: false,
      })
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact, applying_class),
        assigned_user:profiles!follow_ups_assigned_to_fkey(id, full_name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from("activities").insert({
      enquiry_id: body.enquiryId,
      type: "FOLLOW_UP",
      outcome: `Follow-up scheduled for ${body.followUpDate}`,
      remarks: body.notes || `Type: ${body.type || "CALL"}`,
      performed_at: new Date().toISOString(),
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
