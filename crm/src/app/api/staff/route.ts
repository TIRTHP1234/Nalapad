import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/staff — list all staff profiles
export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url, is_active, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/staff — create a new staff account
export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await req.json();

    const { email, password, fullName, role } = body;

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: "Email, password, full name, and role are required." }, { status: 400 });
    }

    // 1. Create auth user
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
    });

    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 400 });
    }

    // 2. Upsert profile
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .upsert({
        id: authUser.user.id,
        email,
        full_name: fullName,
        role,
        is_active: true,
      })
      .select()
      .single();

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    return NextResponse.json({ data: profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
