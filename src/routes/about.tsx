import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import heroPastries from "@/assets/hero-pastries.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — IZ Patisserie" },
      { name: "description", content: "The story of IZ Patisserie & Cafe — boutique desserts crafted with love in Dhaka." },
      { property: "og:title", content: "About — IZ Patisserie" },
      { property: "og:description", content: "The story behind our boutique patisserie." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-rose-gold mb-4">Our Story</p>
          <h1 className="font-serif text-4xl xs:text-5xl sm:text-6xl text-cocoa leading-[1.05] mb-6">
            A love letter, baked daily.
          </h1>
          <div className="space-y-5 text-foreground/75 leading-relaxed">
            <p>
              IZ Patisserie & Cafe began in a tiny home kitchen with one goal — to bring the soft, romantic patisserie experience of Paris and Tokyo to Dhaka.
            </p>
            <p>
              Every cake, brownie and macaron is hand-crafted with French butter, Belgian chocolate and the kind of obsessive care you can taste in the first bite.
            </p>
            <p>
              We believe dessert is more than an indulgence — it's a quiet ritual, a small celebration, a way of saying I love you without words.
            </p>
          </div>
        </div>
        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-elegant">
          <img src={heroPastries} alt="Patisserie" className="w-full h-full object-cover" loading="lazy" />
        </div>
      </section>
      <Footer />
    </div>
  );
}
