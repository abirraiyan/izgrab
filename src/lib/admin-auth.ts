import { supabase } from "@/integrations/supabase/client";

export async function isAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) return false;

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", session.user.email)
    .single();

  if (error || !admin) {
    return false;
  }

  return true;
}

export async function logout() {
  await supabase.auth.signOut();
}
