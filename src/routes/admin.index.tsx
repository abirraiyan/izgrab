import { createFileRoute, Link } from "@tanstack/react-router";
import { useCms } from "@/lib/cms-store";
import { Package, Images, ShoppingCart, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function Overview() {
  const { products, slides, orders } = useCms();
  const newOrders = orders.filter((o) => o.status === "new");
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((a, b) => a + b.total, 0);

  const stats = [
    { label: "Products", value: products.length, icon: Package, to: "/admin/products" },
    { label: "Hero slides", value: slides.length, icon: Images, to: "/admin/banners" },
    {
      label: "New orders",
      value: newOrders.length,
      icon: ShoppingCart,
      to: "/admin/orders",
    },
    {
      label: "Total revenue",
      value: `৳${revenue.toLocaleString()}`,
      icon: TrendingUp,
      to: "/admin/orders",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-cocoa">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your products, banners, orders, and site content from one place.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="bg-card border border-border rounded-2xl p-5 hover:shadow-soft transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs tracking-wide uppercase text-muted-foreground">
                {label}
              </p>
              <Icon className="w-4 h-4 text-rose-gold" />
            </div>
            <p className="font-serif text-3xl text-cocoa mt-3">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg text-cocoa mb-4">Recent orders</h3>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-cocoa">{o.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString()} · {o.items.length} item(s)
                    </p>
                  </div>
                  <span className="text-cocoa font-medium">
                    ৳{o.total.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/admin/orders"
            className="inline-block mt-4 text-xs text-cocoa underline"
          >
            View all orders →
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg text-cocoa mb-4">Quick actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/products"
              className="bg-cocoa text-cocoa-foreground rounded-xl p-4 text-sm hover:opacity-90 transition"
            >
              + Add product
            </Link>
            <Link
              to="/admin/banners"
              className="bg-blush text-cocoa rounded-xl p-4 text-sm hover:opacity-90 transition"
            >
              + Add hero slide
            </Link>
            <Link
              to="/admin/settings"
              className="bg-cream text-cocoa border border-border rounded-xl p-4 text-sm hover:border-cocoa transition"
            >
              Edit announcements
            </Link>
            <Link
              to="/admin/settings"
              className="bg-cream text-cocoa border border-border rounded-xl p-4 text-sm hover:border-cocoa transition"
            >
              Update contact info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
