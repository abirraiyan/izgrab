import { supabase } from "@/integrations/supabase/client";

export async function isAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    console.log("[AuthAudit] isAdmin check failed: No active session found.");
    return false;
  }

  console.log("[AuthAudit] Checking admin status for user:", {
    id: session.user.id,
    email: session.user.email
  });

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("[AuthAudit] Error querying profiles table:", error.message);
    return false;
  }

  if (!profile) {
    console.error("[AuthAudit] No profile record found for user ID:", session.user.id);
    return false;
  }

  console.log("[AuthAudit] Profile found. Role is:", profile.role);
  const authorized = profile.role === "admin" || profile.role === "super_admin";
  
  if (!authorized) {
    console.warn("[AuthAudit] User role is not authorized for admin access:", profile.role);
  }
  
  return authorized;
}

export async function logout() {
  await supabase.auth.signOut();
}
