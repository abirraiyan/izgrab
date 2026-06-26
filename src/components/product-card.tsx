import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { cartStore } from "@/lib/cart-store";

export function ProductCard({ product }: { product: Product }) {
  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.add({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes[0],
      flavor: product.flavors[0],
      qty: 1,
    });
    toast.success(`${product.name} added to basket`);
  };

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-500"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={1024}
          height={1280}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.video && (
          <video
            src={product.video}
            muted
            loop
            playsInline
            preload="none"
            onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}
        {product.tag && (
          <span className="absolute top-3 left-3 bg-cocoa text-cocoa-foreground text-[9px] font-semibold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full">
            {product.tag}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-serif text-base sm:text-lg text-cocoa leading-tight line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {product.description.split(".")[0]}.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-medium text-cocoa text-sm sm:text-base">
            ৳{product.price.toLocaleString()}
          </span>
          <button
            onClick={quickAdd}
            aria-label="Add to cart"
            className="w-9 h-9 rounded-full bg-blush/60 hover:bg-cocoa hover:text-cocoa-foreground text-cocoa flex items-center justify-center transition-all active:scale-90"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
