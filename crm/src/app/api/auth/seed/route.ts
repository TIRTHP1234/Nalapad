import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Check existing auth users
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 500 });
    }

    // Standard staff roster for Nalapad Academy CRM
    const staffRoster = [
      {
        email: "admin@nalapad.edu",
        password: "Password@123",
        fullName: "Tirth Patel (Admin)",
        role: "SUPER_ADMIN",
      },
      {
        email: "principal@nalapad.edu",
        password: "Password@123",
        fullName: "Dr. K. Nalapad (Principal)",
        role: "PRINCIPAL",
      },
      {
        email: "priya.sharma@nalapad.edu",
        password: "Password@123",
        fullName: "Priya Sharma",
        role: "ADMISSION_COUNSELLOR",
      },
      {
        email: "arun.patel@nalapad.edu",
        password: "Password@123",
        fullName: "Arun Patel",
        role: "ADMISSION_COUNSELLOR",
      },
    ];

    const results = [];

    for (const staff of staffRoster) {
      let authUser = authData.users.find((u) => u.email === staff.email);

      if (!authUser) {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: staff.email,
          password: staff.password,
          email_confirm: true,
          user_metadata: {
            full_name: staff.fullName,
            role: staff.role,
          },
        });
        if (createErr) {
          results.push({ email: staff.email, status: "create_failed", error: createErr.message });
          continue;
        }
        authUser = created.user;
      } else {
        await supabase.auth.admin.updateUserById(authUser.id, {
          password: staff.password,
          email_confirm: true,
          user_metadata: {
            full_name: staff.fullName,
            role: staff.role,
          },
        });
      }

      if (authUser) {
        const { error: upsertErr } = await supabase.from("profiles").upsert({
          id: authUser.id,
          email: staff.email,
          full_name: staff.fullName,
          role: staff.role,
          is_active: true,
        });

        if (upsertErr) {
          results.push({ email: staff.email, status: "profile_upsert_failed", error: upsertErr.message });
        } else {
          results.push({ email: staff.email, status: "ready", role: staff.role, id: authUser.id });
        }
      }
    }

    const { data: finalProfiles } = await supabase.from("profiles").select("*");

    return NextResponse.json({
      success: true,
      results,
      profiles: finalProfiles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
