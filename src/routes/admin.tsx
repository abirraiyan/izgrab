import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, Component, type ReactNode, type ErrorInfo } from "react";
import {
  LayoutDashboard,
  Package,
  Images,
  Settings as SettingsIcon,
  ShoppingCart,
  LogOut,
  Home,
  AlertCircle,
  Folder,
} from "lucide-react";
import { isAdmin, logout } from "@/lib/admin-auth";
import { useCms } from "@/lib/cms-store";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class AdminErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[AdminErrorBoundary] Uncaught administrative sub-tree error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6">
          <div className="bg-card border border-destructive/20 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-soft text-cocoa">
            <div className="flex items-center gap-3 text-destructive mb-4">
              <AlertCircle className="w-8 h-8" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold">Admin Dashboard Error</h2>
            </div>
            
            <p className="text-sm text-foreground/80 mb-4 font-semibold">
              An unexpected runtime error occurred inside the admin component tree.
            </p>

            <div className="bg-muted p-4 rounded-xl border border-border overflow-auto max-h-[120px] mb-4">
              <p className="text-xs font-bold text-destructive">
                {this.state.error?.name || "Error"}: {this.state.error?.message}
              </p>
            </div>

            {isDev && this.state.error && (
              <div className="bg-muted p-4 rounded-xl border border-border overflow-auto max-h-[200px] mb-4 font-mono text-[10px] text-foreground/70 whitespace-pre">
                {this.state.error.stack}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-cocoa text-cream py-2.5 rounded-full text-xs font-semibold hover:opacity-90 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    async function check() {
      if (location.pathname === "/admin/login") {
        console.log("[AdminShell] Current route is login page. Skipping verification.");
        setCheckingAuth(false);
        return;
      }
      try {
        console.log("[AdminShell] Verifying admin session status...");
        const isAuthed = await isAdmin();
        console.log("[AdminShell] Admin verification resolved:", isAuthed);
        if (!isAuthed) {
          console.warn("[AdminShell] User is not authorized as admin. Redirecting to login...");
          navigate("/admin/login");
        } else {
          console.log("[AdminShell] Authorized successfully. Granting entry.");
          setAuthed(true);
        }
      } catch (err) {
        console.error("[AdminShell] Verification failed with exception:", err);
        navigate("/admin/login");
      } finally {
        setCheckingAuth(false);
      }
    }
    check();
  }, [location.pathname, navigate]);

  // Setup auth listener to log out automatically if session expires
  useEffect(() => {
    let sub: any = null;
    try {
      console.log("[AdminShell] Initialising auth listener...");
      const res = supabase.auth.onAuthStateChange((event, session) => {
        console.log("[AdminShell] Auth event triggered:", event, "Session exists:", !!session);
        if ((event === "SIGNED_OUT" || !session) && location.pathname !== "/admin/login") {
          console.warn("[AdminShell] Session expired or logged out. Redirecting to login...");
          navigate("/admin/login");
        }
      });
      sub = res?.data?.subscription;
    } catch (err) {
      console.error("[AdminShell] Failed to register auth state listener:", err);
    }
    return () => {
      if (sub) {
        console.log("[AdminShell] Cleaning up auth listener...");
        try {
          sub.unsubscribe();
        } catch (unsubErr) {
          console.error("[AdminShell] Listener unsubscribe failed:", unsubErr);
        }
      }
    };
  }, [location.pathname, navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-muted-foreground animate-pulse">Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (location.pathname === "/admin/login") {
    return (
      <AdminErrorBoundary>
        <Outlet />
      </AdminErrorBoundary>
    );
  }

  if (!authed) {
    console.log("[AdminShell] Not authenticated. Rendering null fallback.");
    return null;
  }

  return (
    <AdminErrorBoundary>
      <AdminLayout />
    </AdminErrorBoundary>
  );
}

type NavItem = {
  to: "/admin" | "/admin/products" | "/admin/categories" | "/admin/banners" | "/admin/orders" | "/admin/settings" | "/admin/media";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const nav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Folder },
  { to: "/admin/banners", label: "Hero Slides", icon: Images },
  { to: "/admin/media", label: "Media Library", icon: Images },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/settings", label: "Site Settings", icon: SettingsIcon },
];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orders } = useCms();
  const newOrders = orders.filter((o) => o.status === "new").length;
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <SEO title="Admin · IZ Patisserie" robots="noindex, nofollow" />
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-cocoa text-cocoa-foreground flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 pt-7 pb-6 border-b border-cocoa-foreground/10">
          <p className="text-[10px] tracking-[0.32em] uppercase opacity-70">IZ Patisserie</p>
          <h2 className="font-serif text-2xl mt-1">Admin Panel</h2>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {nav.map(({ to, label, icon: Icon, exact }) => {
            const active = exact
              ? location.pathname === to
              : location.pathname === to || location.pathname.startsWith(`${to}/`);
            const badge = label === "Orders" && newOrders > 0 ? newOrders : null;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm transition ${
                  active ? "bg-cream text-cocoa font-medium" : "hover:bg-cocoa-foreground/10"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
                {badge && (
                  <span className="bg-rose-gold text-cocoa text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-5 space-y-1 border-t border-cocoa-foreground/10 pt-4">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm hover:bg-cocoa-foreground/10"
          >
            <Home className="w-4 h-4" /> Back to home
          </Link>
          <button
            onClick={async () => {
              await logout();
              navigate("/admin/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm hover:bg-cocoa-foreground/10"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-cocoa/60 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-background border-b border-border h-16 flex items-center px-4 sm:px-8 sticky top-0 z-20">
          <button
            className="lg:hidden mr-3 p-2 -ml-2"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-5 h-0.5 bg-cocoa mb-1.5" />
            <span className="block w-5 h-0.5 bg-cocoa mb-1.5" />
            <span className="block w-5 h-0.5 bg-cocoa" />
          </button>
          <h1 className="font-serif text-lg sm:text-xl text-cocoa">
            {nav.find(
              (n) =>
                n.to === location.pathname ||
                (!n.exact && location.pathname.startsWith(`${n.to}/`)),
            )?.label ?? "Dashboard"}
          </h1>
        </header>
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
