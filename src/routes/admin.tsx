import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Images,
  Settings as SettingsIcon,
  ShoppingCart,
  LogOut,
  Home,
} from "lucide-react";
import { isAdmin, logout } from "@/lib/admin-auth";
import { useCms } from "@/lib/cms-store";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo";

type NavItem = {
  to: "/admin" | "/admin/products" | "/admin/banners" | "/admin/orders" | "/admin/settings";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const nav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/banners", label: "Hero Slides", icon: Images },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/settings", label: "Site Settings", icon: SettingsIcon },
];

export default function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    async function check() {
      if (location.pathname === "/admin/login") {
        setCheckingAuth(false);
        return;
      }
      const isAuthed = await isAdmin();
      if (!isAuthed) {
        navigate("/admin/login");
      } else {
        setAuthed(true);
      }
      setCheckingAuth(false);
    }
    check();
  }, [location.pathname, navigate]);

  // Setup auth listener to log out automatically if session expires
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_OUT" || !session) && location.pathname !== "/admin/login") {
        navigate("/admin/login");
      }
    });
    return () => {
      subscription.unsubscribe();
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
    return <Outlet />;
  }

  if (!authed) {
    return null; // Will redirect via useEffect
  }

  return <AdminLayout />;
}

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
