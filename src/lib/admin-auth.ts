import { supabase } from "@/integrations/supabase/client";

export async function isAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) return false;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    return false;
  }

  return profile.role === "admin" || profile.role === "super_admin";
}

export async function logout() {
  await supabase.auth.signOut();
}
