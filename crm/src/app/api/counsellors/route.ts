import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/counsellors — list active counsellors and managers
export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url")
      .eq("is_active", true)
      .in("role", ["ADMISSION_COUNSELLOR", "ADMISSION_MANAGER", "SUPER_ADMIN"])
      .order("full_name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
