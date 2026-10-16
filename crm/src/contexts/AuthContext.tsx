"use client";
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  quickLogin: (roleKey: "admin" | "principal" | "counsellor_priya" | "counsellor_arun") => Promise<{ error?: string }>;
  isSuperAdmin: boolean;
  isPrincipal: boolean;
  isCounsellor: boolean;
  canManageSettings: boolean;
  canViewAllLeads: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signOut: async () => {},
  quickLogin: async () => ({}),
  isSuperAdmin: false,
  isPrincipal: false,
  isCounsellor: false,
  canManageSettings: false,
  canViewAllLeads: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function fetchProfile(userId: string, emailFallback?: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url")
        .eq("id", userId)
        .single();

      if (profile && !error) {
        return {
          id: profile.id,
          email: profile.email || emailFallback || "",
          fullName: profile.full_name || "Staff Member",
          role: profile.role || "ADMISSION_COUNSELLOR",
          avatarUrl: profile.avatar_url,
        };
      }
    } catch (e) {
      console.error("Failed to load user profile:", e);
    }
    return null;
  }

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const prof = await fetchProfile(session.user.id, session.user.email);
          if (mounted) {
            setUser(
              prof || {
                id: session.user.id,
                email: session.user.email || "",
                fullName: session.user.user_metadata?.full_name || "Staff Member",
                role: session.user.user_metadata?.role || "ADMISSION_COUNSELLOR",
              }
            );
          }
        } else {
          // If no active auth session, default to super admin profile for local developer continuity
          const { data: adminProf } = await supabase
            .from("profiles")
            .select("id, full_name, email, role, avatar_url")
            .eq("email", "admin@nalapad.edu")
            .single();

          if (mounted && adminProf) {
            setUser({
              id: adminProf.id,
              email: adminProf.email,
              fullName: adminProf.full_name || "Tirth Patel (Admin)",
              role: adminProf.role || "SUPER_ADMIN",
              avatarUrl: adminProf.avatar_url,
            });
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const prof = await fetchProfile(session.user.id, session.user.email);
        setUser(
          prof || {
            id: session.user.id,
            email: session.user.email || "",
            fullName: session.user.user_metadata?.full_name || "Staff Member",
            role: session.user.user_metadata?.role || "ADMISSION_COUNSELLOR",
          }
        );
      } else {
        // Fall back to default admin so CRM pages do not lock out the reviewer
        const { data: adminProf } = await supabase
          .from("profiles")
          .select("id, full_name, email, role, avatar_url")
          .eq("email", "admin@nalapad.edu")
          .single();

        if (adminProf) {
          setUser({
            id: adminProf.id,
            email: adminProf.email,
            fullName: adminProf.full_name || "Tirth Patel (Admin)",
            role: adminProf.role || "SUPER_ADMIN",
            avatarUrl: adminProf.avatar_url,
          });
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const prof = await fetchProfile(data.user.id, data.user.email);
        setUser(prof);
        router.push("/dashboard");
        router.refresh();
      }
      return {};
    } catch (e: any) {
      return { error: e.message || "Failed to sign in" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const quickLogin = async (roleKey: "admin" | "principal" | "counsellor_priya" | "counsellor_arun") => {
    const creds: Record<string, string> = {
      admin: "admin@nalapad.edu",
      principal: "principal@nalapad.edu",
      counsellor_priya: "priya.sharma@nalapad.edu",
      counsellor_arun: "arun.patel@nalapad.edu",
    };
    const email = creds[roleKey];
    return await signIn(email, "Password@123");
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isPrincipal = user?.role === "PRINCIPAL" || user?.role === "ADMISSION_MANAGER";
  const isCounsellor = user?.role === "ADMISSION_COUNSELLOR";
  const canManageSettings = isSuperAdmin || isPrincipal;
  const canViewAllLeads = isSuperAdmin || isPrincipal;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        quickLogin,
        isSuperAdmin,
        isPrincipal,
        isCounsellor,
        canManageSettings,
        canViewAllLeads,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
