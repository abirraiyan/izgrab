import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, Truck, Leaf, Heart, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { cmsStore, useCms } from "@/lib/cms-store";
import { cartStore } from "@/lib/cart-store";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = cmsStore.getSnapshot().products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — IZ Patisserie` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-serif text-3xl text-cocoa mb-3">Dessert not found</p>
        <Link to="/shop" className="text-cocoa underline">Back to shop</Link>
      </div>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product: initial } = Route.useLoaderData();
  const { products } = useCms();
  const product = products.find((p) => p.slug === initial.slug) ?? initial;
  const [size, setSize] = useState(product.sizes[0]);
  const [flavor, setFlavor] = useState(product.flavors[0]);
  const [qty, setQty] = useState(1);

  const addToCart = () => {
    cartStore.add({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      flavor,
      qty,
    });
    toast.success(`${product.name} added to basket`, {
      description: `${size} · ${flavor} · ×${qty}`,
    });
  };

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cocoa">
          <ArrowLeft className="w-4 h-4" /> All desserts
        </Link>
      </div>

      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 grid lg:grid-cols-2 gap-10 lg:gap-20">
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-muted shadow-soft">
            <img src={product.image} alt={product.name} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[product.image, product.image, product.image, product.image].map((img, i) => (
              <button
                key={i}
                className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border hover:border-cocoa transition"
              >
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:py-6">
          {product.tag && (
            <span className="inline-block bg-blush text-cocoa text-[11px] font-medium tracking-wide px-3 py-1.5 rounded-full mb-4">
              {product.tag}
            </span>
          )}
          <p className="text-xs tracking-[0.3em] uppercase text-rose-gold mb-2">{product.category}</p>
          <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl text-cocoa leading-tight">{product.name}</h1>
          <p className="text-2xl text-cocoa mt-4 font-medium">৳{product.price.toLocaleString()}</p>
          <p className="mt-6 text-foreground/70 leading-relaxed">{product.description}</p>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-sm font-medium text-cocoa mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-5 py-2.5 rounded-full text-sm transition ${
                      size === s
                        ? "bg-cocoa text-cocoa-foreground"
                        : "border border-border hover:border-cocoa"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cocoa mb-3">Flavor</p>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((f: string) => (
                  <button
                    key={f}
                    onClick={() => setFlavor(f)}
                    className={`px-5 py-2.5 rounded-full text-sm transition ${
                      flavor === f
                        ? "bg-cocoa text-cocoa-foreground"
                        : "border border-border hover:border-cocoa"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cocoa mb-3">Quantity</p>
              <div className="inline-flex items-center border border-border rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:text-cocoa" aria-label="Decrease">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 text-base tabular-nums">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-3 hover:text-cocoa" aria-label="Increase">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={addToCart}
              className="flex-1 bg-cocoa text-cocoa-foreground py-4 rounded-full font-medium hover:opacity-90 transition"
            >
              Add to basket — ৳{(product.price * qty).toLocaleString()}
            </button>
            <button className="px-6 py-4 border border-border rounded-full hover:border-cocoa transition" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-4 bg-cream/60 rounded-2xl">
              <Truck className="w-4 h-4 text-rose-gold" />
              <span className="text-cocoa">Same-day delivery</span>
            </div>
            <div className="flex items-center gap-2 p-4 bg-cream/60 rounded-2xl">
              <Leaf className="w-4 h-4 text-rose-gold" />
              <span className="text-cocoa">Premium ingredients</span>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm font-medium text-cocoa mb-2">Ingredients</p>
            <p className="text-sm text-foreground/70">{product.ingredients}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-20">
        <h2 className="font-serif text-3xl sm:text-4xl text-cocoa mb-10">You may also love</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
