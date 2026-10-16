import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/fees — list all fee payments (registrations and admissions)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const url = new URL(req.url);
    const enquiryId = url.searchParams.get("enquiryId");

    let regQuery = supabase
      .from("registrations")
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact, applying_class, father_name, academic_year, status)
      `)
      .order("payment_date", { ascending: false });

    let admQuery = supabase
      .from("admissions")
      .select(`
        *,
        enquiry:enquiries(id, enquiry_id, student_name, primary_contact, applying_class, father_name, academic_year, status)
      `)
      .order("payment_date", { ascending: false });

    if (enquiryId) {
      regQuery = regQuery.eq("enquiry_id", enquiryId);
      admQuery = admQuery.eq("enquiry_id", enquiryId);
    }

    const [{ data: regs, error: regErr }, { data: adms, error: admErr }] = await Promise.all([
      regQuery,
      admQuery,
    ]);

    if (regErr) return NextResponse.json({ error: regErr.message }, { status: 500 });
    if (admErr) return NextResponse.json({ error: admErr.message }, { status: 500 });

    const list = [
      ...(regs || []).map(r => ({ ...r, fee_type: "REGISTRATION", amount: Number(r.amount) })),
      ...(adms || []).filter(a => Number(a.amount_paid) > 0).map(a => ({
        ...a,
        fee_type: "ADMISSION",
        amount: Number(a.amount_paid),
        payment_date: a.payment_date || a.admission_date,
      })),
    ].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

    return NextResponse.json({ data: list });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/fees — collect payment and generate receipt
export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await req.json();

    const {
      enquiryId,
      feeType, // "REGISTRATION" | "ADMISSION"
      amount,
      paymentMode, // "CASH" | "CHEQUE" | "ONLINE" | "UPI" | "DD"
      transactionReference,
      remarks,
    } = body;

    if (!enquiryId || !amount || !paymentMode) {
      return NextResponse.json({ error: "Missing enquiryId, amount, or paymentMode" }, { status: 400 });
    }

    // 1. Fetch enquiry details
    const { data: enquiry, error: enqErr } = await supabase
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single();

    if (enqErr || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // 2. Generate Receipt Number
    const year = new Date().getFullYear();
    const [{ count: regCount }, { count: admCount }] = await Promise.all([
      supabase.from("registrations").select("*", { count: "exact", head: true }),
      supabase.from("admissions").select("*", { count: "exact", head: true }),
    ]);
    const seq = String((regCount || 0) + (admCount || 0) + 1).padStart(4, "0");
    const receiptNumber = `NAL-REC-${year}-${seq}`;
    const today = new Date().toISOString().split("T")[0];

    let resultRecord: any = null;

    if (feeType === "REGISTRATION") {
      // Upsert into registrations
      const { data, error } = await supabase
        .from("registrations")
        .upsert(
          {
            enquiry_id: enquiryId,
            amount: Number(amount),
            payment_date: today,
            payment_mode: paymentMode,
            transaction_reference: transactionReference || null,
            receipt_number: receiptNumber,
            status: "PAID",
          },
          { onConflict: "enquiry_id" }
        )
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      resultRecord = data;

      // Update lead status
      await supabase
        .from("enquiries")
        .update({ status: "REGISTRATION_PAID", updated_at: new Date().toISOString() })
        .eq("id", enquiryId);

      // Log activity
      await supabase.from("activities").insert({
        enquiry_id: enquiryId,
        type: "PAYMENT_FOLLOW_UP",
        outcome: `Registration Fee Received: ₹${Number(amount).toLocaleString("en-IN")}`,
        remarks: `Receipt #${receiptNumber} · Mode: ${paymentMode}${transactionReference ? ` · Ref: ${transactionReference}` : ""}`,
        performed_at: new Date().toISOString(),
      });
    } else {
      // Upsert into admissions
      const { data, error } = await supabase
        .from("admissions")
        .upsert(
          {
            enquiry_id: enquiryId,
            admission_date: today,
            fee_amount: Number(amount),
            amount_paid: Number(amount),
            payment_date: today,
            payment_mode: paymentMode,
            transaction_reference: transactionReference || null,
            receipt_number: receiptNumber,
            status: "CONFIRMED",
          },
          { onConflict: "enquiry_id" }
        )
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      resultRecord = data;

      // Update lead status to ADMISSION_CONFIRMED
      await supabase
        .from("enquiries")
        .update({ status: "ADMISSION_CONFIRMED", updated_at: new Date().toISOString() })
        .eq("id", enquiryId);

      // Log activity
      await supabase.from("activities").insert({
        enquiry_id: enquiryId,
        type: "ADMISSION_CONFIRMATION",
        outcome: `Admission Confirmed & Fee Paid: ₹${Number(amount).toLocaleString("en-IN")}`,
        remarks: `Receipt #${receiptNumber} · Mode: ${paymentMode}${transactionReference ? ` · Ref: ${transactionReference}` : ""}`,
        performed_at: new Date().toISOString(),
      });
    }

    // 3. Return full receipt package for instant printing/download
    return NextResponse.json({
      success: true,
      receipt: {
        receiptNumber,
        date: today,
        feeType: feeType || "REGISTRATION",
        amount: Number(amount),
        paymentMode,
        transactionReference: transactionReference || "N/A",
        studentName: enquiry.student_name,
        enquiryId: enquiry.enquiry_id,
        fatherName: enquiry.father_name || "Parent",
        contact: enquiry.primary_contact,
        applyingClass: enquiry.applying_class,
        academicYear: enquiry.academic_year || "2025-26",
        campus: enquiry.campus || "Main Campus",
        remarks: remarks || "",
      },
      data: resultRecord,
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
