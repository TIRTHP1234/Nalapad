import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const enquiryId = formData.get("enquiryId") as string | null;
    const documentName = formData.get("documentName") as string | null;
    const documentId = formData.get("documentId") as string | null;

    if (!file || !enquiryId || !documentName) {
      return NextResponse.json(
        { error: "File, enquiryId, and documentName are required." },
        { status: 400 }
      );
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Build unique storage path
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const safeSlug = documentName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const storagePath = `${enquiryId}/${safeSlug}_${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage bucket: admission-documents
    const { error: uploadError } = await supabase.storage
      .from("admission-documents")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Retrieve public access URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("admission-documents").getPublicUrl(storagePath);

    // Upsert or update record in documents table
    let savedDoc: any = null;

    if (documentId) {
      const { data: updated, error: updateErr } = await supabase
        .from("documents")
        .update({
          file_url: publicUrl,
          status: "SUBMITTED",
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
      savedDoc = updated;
    } else {
      // Check if document with same name exists
      const { data: existing } = await supabase
        .from("documents")
        .select("id")
        .eq("enquiry_id", enquiryId)
        .eq("name", documentName)
        .maybeSingle();

      if (existing) {
        const { data: updated, error: updateErr } = await supabase
          .from("documents")
          .update({
            file_url: publicUrl,
            status: "SUBMITTED",
            uploaded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (updateErr) {
          return NextResponse.json({ error: updateErr.message }, { status: 500 });
        }
        savedDoc = updated;
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from("documents")
          .insert({
            enquiry_id: enquiryId,
            name: documentName,
            file_url: publicUrl,
            status: "SUBMITTED",
            uploaded_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertErr) {
          return NextResponse.json({ error: insertErr.message }, { status: 500 });
        }
        savedDoc = inserted;
      }
    }

    // Auto-record chronological activity in candidate timeline
    try {
      await supabase.from("activities").insert({
        enquiry_id: enquiryId,
        type: "DOCUMENT_COLLECTION",
        outcome: `Uploaded: ${documentName}`,
        remarks: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      });
    } catch (actErr) {
      console.warn("Failed to log activity for document upload:", actErr);
    }

    return NextResponse.json({
      data: savedDoc,
      publicUrl,
      message: "Document uploaded successfully.",
    });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
