import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { useCms } from "@/lib/cms-store";
import { useState } from "react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Cafe Menu — IZ Patisserie" },
      { name: "description", content: "Browse IZ Patisserie & Cafe coffee, croissants, cakes, desserts and hearty meals." },
      { property: "og:title", content: "Shop — IZ Patisserie" },
      { property: "og:description", content: "Quality coffee, croissants, cakes, desserts and comfort meals." },
    ],
  }),
  component: Shop,
});

const filters = ["All", "Coffee", "Croissants", "Cakes", "Desserts", "Meals"];

function Shop() {
  const { products } = useCms();
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container mx-auto px-4 sm:px-6 pt-12 pb-8 sm:pt-20">
        <p className="text-xs tracking-[0.3em] uppercase text-rose-gold mb-4">The Collection</p>
        <h1 className="font-serif text-4xl xs:text-5xl sm:text-6xl text-cocoa max-w-2xl leading-[1.05]">
          Coffee, desserts and café favourites.
        </h1>
        <p className="mt-5 text-foreground/70 max-w-xl">
          Browse signature coffee, croissants, chilled desserts and comforting meals from IZ Patisserie & Cafe.
        </p>
      </section>

      <section className="container mx-auto px-4 sm:px-6 sticky top-16 sm:top-20 z-30 bg-background/85 backdrop-blur py-4 border-b border-border">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-cocoa text-cocoa-foreground"
                  : "border border-border text-foreground/80 hover:border-cocoa hover:text-cocoa"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-20">No items in this category yet.</p>
        )}
      </section>

      <Footer />
    </div>
  );
}
