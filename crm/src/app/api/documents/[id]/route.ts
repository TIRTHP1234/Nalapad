import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAdminClient();
    const { id } = await params;
    const body = await req.json();

    const { status, remarks } = body;

    if (status && !["PENDING", "SUBMITTED", "VERIFIED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be PENDING, SUBMITTED, or VERIFIED." },
        { status: 400 }
      );
    }

    // Get current doc
    const { data: existing, error: fetchErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (remarks !== undefined) updatePayload.remarks = remarks;

    const { data: updated, error: updateErr } = await supabase
      .from("documents")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Record activity in candidate timeline
    try {
      if (status === "VERIFIED") {
        await supabase.from("activities").insert({
          enquiry_id: existing.enquiry_id,
          type: "DOCUMENT_COLLECTION",
          outcome: `Verified: ${existing.name}`,
          remarks: remarks || "Document verified and approved by admissions team.",
        });
      } else if (status === "PENDING" && existing.status !== "PENDING") {
        await supabase.from("activities").insert({
          enquiry_id: existing.enquiry_id,
          type: "DOCUMENT_COLLECTION",
          outcome: `Re-upload Requested: ${existing.name}`,
          remarks: remarks || "Document marked pending for re-upload.",
        });
      }
    } catch (actErr) {
      console.warn("Failed to log activity:", actErr);
    }

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAdminClient();
    const { id } = await params;

    const { data: existing, error: fetchErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Reset document record to PENDING with empty file_url
    const { data: updated, error: updateErr } = await supabase
      .from("documents")
      .update({
        file_url: null,
        status: "PENDING",
        uploaded_at: null,
        remarks: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      data: updated,
      message: "Document file removed and status reset to Pending.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
