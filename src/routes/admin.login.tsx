import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEO } from "@/components/seo";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pw,
      });

      if (error) {
        toast.error("Invalid credentials");
        setSubmitting(false);
        return;
      }

      if (!data.session) {
        toast.error("Login failed");
        setSubmitting(false);
        return;
      }

      // Check if user is in admin_users
      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", data.session.user.email)
        .single();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        toast.error("Access denied");
        setSubmitting(false);
        return;
      }

      // Success
      toast.success("Logged in successfully");
      navigate("/admin");
    } catch (err) {
      toast.error("An unexpected error occurred");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-blush/30 flex items-center justify-center p-6">
      <SEO title="Admin Login · IZ Patisserie" robots="noindex, nofollow" />
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-elegant p-8"
      >
        <div className="w-12 h-12 rounded-full bg-cocoa text-cocoa-foreground flex items-center justify-center mb-5">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="font-serif text-2xl text-cocoa">Admin Access</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Restricted area. Enter your email and password.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <input
              type="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none transition focus:border-cocoa"
            />
          </div>

          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-sm outline-none transition focus:border-cocoa"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-cocoa transition z-10 cursor-pointer"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !email || !pw}
          className="mt-6 w-full bg-cocoa text-cocoa-foreground py-3 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <Link
          to="/"
          className="mt-4 block text-center text-xs text-muted-foreground hover:text-cocoa"
        >
          ← Back to site
        </Link>
      </form>
    </div>
  );
}
