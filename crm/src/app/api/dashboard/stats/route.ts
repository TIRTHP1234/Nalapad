import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    // Parallel fetch counts
    const [
      totalRes,
      newRes,
      followUpRes,
      walkInRes,
      registeredRes,
      admittedRes,
      dnpRes,
      todayFollowUpsRes,
      overdueFollowUpsRes,
      openTasksRes,
      receiptsRes,
    ] = await Promise.all([
      supabase.from("enquiries").select("*", { count: "exact", head: true }),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "NEW"),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "FOLLOW_UP"),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).in("status", ["WALK_IN_SCHEDULED", "WALK_IN_DONE"]),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).in("status", ["REGISTRATION_PENDING", "REGISTRATION_PAID"]),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "ADMISSION_CONFIRMED"),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "DNP"),
      supabase.from("follow_ups").select("*", { count: "exact", head: true }).eq("follow_up_date", today).eq("completed", false),
      supabase.from("follow_ups").select("*", { count: "exact", head: true }).lt("follow_up_date", today).eq("completed", false),
      supabase.from("tasks").select("*", { count: "exact", head: true }).in("status", ["OPEN", "IN_PROGRESS"]),
      supabase.from("fee_receipts").select("fee_type, amount"),
    ]);

    const total = totalRes.count || 0;
    const confirmed = admittedRes.count || 0;
    const conversionRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

    let registrationFees = 0;
    let admissionFees = 0;
    if (receiptsRes && Array.isArray(receiptsRes.data)) {
      receiptsRes.data.forEach((r: any) => {
        const amt = Number(r.amount) || 0;
        if (r.fee_type === "REGISTRATION") {
          registrationFees += amt;
        } else {
          admissionFees += amt;
        }
      });
    }

    return NextResponse.json({
      data: {
        totalEnquiries: total,
        newEnquiries: newRes.count || 0,
        followUps: followUpRes.count || 0,
        walkIns: walkInRes.count || 0,
        registered: registeredRes.count || 0,
        admissionsConfirmed: confirmed,
        dnp: dnpRes.count || 0,
        conversionRate,
        todayFollowUps: todayFollowUpsRes.count || 0,
        overdueFollowUps: overdueFollowUpsRes.count || 0,
        openTasks: openTasksRes.count || 0,
        registrationFees,
        admissionFees,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
