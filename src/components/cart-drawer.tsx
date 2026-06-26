import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { cartStore, useCart, itemKey } from "@/lib/cart-store";

export function CartDrawer() {
  const cart = useCart();
  const subtotal = cart.items.reduce((a, b) => a + b.price * b.qty, 0);

  return (
    <div
      className={`fixed inset-0 z-50 ${cart.open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!cart.open}
    >
      <div
        className={`absolute inset-0 bg-cocoa/40 backdrop-blur-sm transition-opacity duration-300 ${
          cart.open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => cartStore.setOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-background flex flex-col shadow-elegant transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          cart.open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-serif text-2xl text-cocoa">Your Basket</h2>
          <button
            onClick={() => cartStore.setOpen(false)}
            className="p-1 hover:text-cocoa"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
              <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-cocoa" />
              </div>
              <p className="font-serif text-xl text-cocoa">Your basket is empty</p>
              <p className="text-sm text-muted-foreground">Treat yourself to something sweet.</p>
              <Link
                to="/shop"
                onClick={() => cartStore.setOpen(false)}
                className="mt-2 inline-flex items-center px-6 py-3 bg-cocoa text-cocoa-foreground rounded-full text-sm font-medium hover:opacity-90"
              >
                Browse desserts
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {cart.items.map((i) => {
                const k = itemKey(i);
                return (
                  <li key={k} className="py-4 flex gap-4">
                    <img
                      src={i.image}
                      alt={i.name}
                      className="w-20 h-20 rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-serif text-base text-cocoa truncate">{i.name}</h3>
                        <button
                          onClick={() => cartStore.remove(k)}
                          className="text-muted-foreground hover:text-cocoa text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {i.size} · {i.flavor}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="inline-flex items-center border border-border rounded-full">
                          <button
                            onClick={() => cartStore.updateQty(k, i.qty - 1)}
                            className="p-1.5 hover:text-cocoa"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm tabular-nums">{i.qty}</span>
                          <button
                            onClick={() => cartStore.updateQty(k, i.qty + 1)}
                            className="p-1.5 hover:text-cocoa"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-medium text-cocoa">৳{(i.price * i.qty).toLocaleString()}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {cart.items.length > 0 && (
          <footer className="border-t border-border px-6 py-5 space-y-4 bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-cocoa">৳{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Delivery & taxes calculated at checkout.</p>
            <Link
              to="/checkout"
              onClick={() => cartStore.setOpen(false)}
              className="w-full block text-center bg-cocoa text-cocoa-foreground rounded-full py-3.5 font-medium hover:opacity-90 transition"
            >
              Checkout · ৳{subtotal.toLocaleString()}
            </Link>
            <button
              onClick={() => cartStore.setOpen(false)}
              className="w-full text-sm text-muted-foreground hover:text-cocoa"
            >
              Continue shopping
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
