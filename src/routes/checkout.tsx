import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cartStore, useCart, itemKey } from "@/lib/cart-store";
import { cmsStore } from "@/lib/cms-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — IZ Patisserie" },
      { name: "description", content: "Complete your order from IZ Patisserie & Cafe." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.items.reduce((a, b) => a + b.price * b.qty, 0);
  const delivery = subtotal > 0 ? 80 : 0;
  const total = subtotal + delivery;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.items.length === 0) return;
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "Customer");
    const orderItems = cart.items.map((i) => ({
      name: i.name,
      qty: i.qty,
      price: i.price,
      size: i.size,
      flavor: i.flavor,
    }));
    cmsStore.addOrder({
      id: `ord_${Date.now().toString(36)}`,
      createdAt: Date.now(),
      name,
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      address: String(data.get("address") || ""),
      area: String(data.get("area") || ""),
      city: String(data.get("city") || ""),
      notes: String(data.get("notes") || ""),
      payment: String(data.get("pay") || "cod"),
      items: orderItems,
      subtotal,
      delivery,
      total,
      status: "new",
    });
    setTimeout(() => {
      cartStore.clear();
      setSubmitting(false);
      toast.success(`Thank you, ${name}! Your order is confirmed.`, {
        description: "We'll WhatsApp you shortly to schedule delivery.",
      });
      navigate({ to: "/" });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 pt-6">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cocoa">
          <ArrowLeft className="w-4 h-4" /> Continue shopping
        </Link>
      </div>

      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl text-cocoa mb-8 sm:mb-10">Checkout</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-cocoa mb-3">Your basket is empty</p>
            <Link to="/shop" className="inline-flex mt-4 px-6 py-3 bg-cocoa text-cocoa-foreground rounded-full text-sm">
              Browse desserts
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-8 lg:gap-12 xl:gap-14">
            <form onSubmit={onSubmit} className="space-y-8">
              <div>
                <h2 className="font-serif text-xl text-cocoa mb-4">Contact</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input name="name" required placeholder="Full name" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-cocoa" />
                  <input name="phone" required placeholder="Phone (WhatsApp)" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-cocoa" />
                  <input name="email" type="email" required placeholder="Email" className="sm:col-span-2 px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-cocoa" />
                </div>
              </div>

              <div>
                <h2 className="font-serif text-xl text-cocoa mb-4">Delivery address</h2>
                <div className="grid gap-3">
                  <input name="address" required placeholder="Street address, apt / floor" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-cocoa" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input name="area" required placeholder="Area (e.g. Mirpur-12)" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-cocoa" />
                    <input name="city" required defaultValue="Dhaka" placeholder="City" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-cocoa" />
                  </div>
                  <textarea name="notes" placeholder="Delivery notes (optional)" rows={3} className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-cocoa resize-none" />
                </div>
              </div>

              <div>
                <h2 className="font-serif text-xl text-cocoa mb-4">Payment</h2>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-cocoa bg-blush/30 cursor-pointer">
                    <input type="radio" name="pay" value="cod" defaultChecked className="accent-cocoa" />
                    <span className="text-sm text-cocoa font-medium">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-cocoa">
                    <input type="radio" name="pay" value="bkash" className="accent-cocoa" />
                    <span className="text-sm">bKash / Nagad (we'll send instructions)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-cocoa text-cocoa-foreground py-4 rounded-full font-medium hover:opacity-90 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {submitting ? "Placing order…" : `Place order · ৳${total.toLocaleString()}`}
              </button>
            </form>

            <aside className="lg:sticky lg:top-28 lg:self-start bg-muted/40 rounded-3xl p-6 space-y-5 h-fit">
              <h2 className="font-serif text-xl text-cocoa">Order summary</h2>
              <ul className="divide-y divide-border">
                {cart.items.map((i) => {
                  const k = itemKey(i);
                  return (
                    <li key={k} className="py-3 flex gap-3">
                      <img src={i.image} alt={i.name} loading="lazy" className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cocoa truncate">{i.name}</p>
                        <p className="text-xs text-muted-foreground">{i.size} · {i.flavor} · ×{i.qty}</p>
                      </div>
                      <span className="text-sm text-cocoa">৳{(i.price * i.qty).toLocaleString()}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="space-y-1 text-sm pt-2 border-t border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>৳{delivery.toLocaleString()}</span></div>
                <div className="flex justify-between font-medium text-cocoa text-base pt-2"><span>Total</span><span>৳{total.toLocaleString()}</span></div>
              </div>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
