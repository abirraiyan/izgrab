import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { cmsStore, useCms, type Order } from "@/lib/cms-store";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

const statusStyles: Record<Order["status"], string> = {
  new: "bg-rose-gold/30 text-cocoa",
  preparing: "bg-blush text-cocoa",
  delivered: "bg-cream border border-cocoa/20 text-cocoa",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusOptions: Order["status"][] = ["new", "preparing", "delivered", "cancelled"];

function OrdersAdmin() {
  const { orders } = useCms();
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [open, setOpen] = useState<Order | null>(null);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-cocoa">Orders</h2>
        <p className="text-sm text-muted-foreground">
          Customer checkouts. Update status as they move through fulfilment.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", ...statusOptions] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition ${
              filter === s
                ? "bg-cocoa text-cocoa-foreground"
                : "bg-card border border-border text-muted-foreground hover:border-cocoa"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && (
              <span className="ml-2 opacity-70">
                ({orders.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs tracking-wide uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setOpen(o)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    #{o.id.slice(-6)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-cocoa">{o.name}</p>
                    <p className="text-xs text-muted-foreground">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-cocoa">
                    ৳{o.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-1 rounded-full uppercase tracking-wide ${statusStyles[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this order?")) {
                          cmsStore.removeOrder(o.id);
                          toast.success("Order deleted");
                        }
                      }}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No orders {filter !== "all" ? `with status "${filter}"` : "yet"}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && <OrderDrawer order={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-cocoa/40" onClick={onClose} />
      <div className="w-full max-w-md bg-background h-full overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Order #{order.id.slice(-6)}
            </p>
            <h3 className="font-serif text-xl text-cocoa">{order.name}</h3>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-6 space-y-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Status
            </p>
            <select
              value={order.status}
              onChange={(e) => {
                cmsStore.setOrderStatus(order.id, e.target.value as Order["status"]);
                toast.success("Status updated");
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:border-cocoa outline-none"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <Section title="Contact">
            <p>{order.phone}</p>
            <p className="text-muted-foreground">{order.email}</p>
          </Section>

          <Section title="Delivery">
            <p>{order.address}</p>
            <p className="text-muted-foreground">
              {order.area}, {order.city}
            </p>
            {order.notes && (
              <p className="mt-2 italic text-xs text-muted-foreground">
                Note: {order.notes}
              </p>
            )}
          </Section>

          <Section title="Items">
            <ul className="divide-y divide-border">
              {order.items.map((it, i) => (
                <li key={i} className="py-2 flex justify-between">
                  <div>
                    <p className="font-medium text-cocoa">{it.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {it.size} · {it.flavor} · ×{it.qty}
                    </p>
                  </div>
                  <span>৳{(it.price * it.qty).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </Section>

          <div className="border-t border-border pt-4 space-y-1">
            <Row label="Subtotal" value={`৳${order.subtotal.toLocaleString()}`} />
            <Row label="Delivery" value={`৳${order.delivery.toLocaleString()}`} />
            <Row
              label="Total"
              value={`৳${order.total.toLocaleString()}`}
              bold
            />
            <Row label="Payment" value={order.payment.toUpperCase()} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between ${bold ? "text-cocoa font-medium text-base" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
