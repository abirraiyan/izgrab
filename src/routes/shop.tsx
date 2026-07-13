import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { useCms } from "@/lib/cms-store";
import { useSearchParams } from "react-router-dom";
import { SEO } from "@/components/seo";

export default function Shop() {
  const { products, categories } = useCms();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  // Filter active categories
  const activeCategories = categories.filter((c) => c.is_active && !c.is_archived);
  
  const matchedCategory = activeCategories.find((c) => c.slug === categoryParam);
  const filter = matchedCategory ? matchedCategory.name : "All";

  const setFilter = (name: string) => {
    if (name === "All") {
      setSearchParams({});
    } else {
      const cat = activeCategories.find((c) => c.name === name);
      if (cat) {
        setSearchParams({ category: cat.slug });
      }
    }
  };

  const filtered = filter === "All" ? products : products.filter((p) => p.category === filter);
  const filters = ["All", ...activeCategories.map((c) => c.name)];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Shop Cafe Menu — IZ Patisserie"
        description="Browse IZ Patisserie & Cafe coffee, croissants, cakes, desserts and hearty meals."
      />
      <Navbar />
      <section className="container mx-auto px-4 sm:px-6 pt-12 pb-8 sm:pt-20">
        <p className="text-xs tracking-[0.3em] uppercase text-rose-gold mb-4">The Collection</p>
        <h1 className="font-serif text-4xl xs:text-5xl sm:text-6xl text-cocoa max-w-2xl leading-[1.05]">
          Coffee, desserts and café favourites.
        </h1>
        <p className="mt-5 text-foreground/70 max-w-xl">
          Browse signature coffee, croissants, chilled desserts and comforting meals from IZ
          Patisserie & Cafe.
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
