import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import customBg from "@/assets/custom-cake-bg.jpg";
import productCustom from "@/assets/product-custom.jpg";

export const Route = createFileRoute("/custom-cake")({
  head: () => ({
    meta: [
      { title: "Custom Cakes — IZ Patisserie" },
      { name: "description", content: "Design your dream cake. Choose size, flavor, message and add a personal touch." },
      { property: "og:title", content: "Custom Cakes — IZ Patisserie" },
      { property: "og:description", content: "Hand-crafted custom cakes for every occasion." },
      { property: "og:image", content: productCustom },
    ],
  }),
  component: CustomCake,
});

const sizes = [
  { label: '6"', desc: "Serves 6–8" },
  { label: '8"', desc: "Serves 12–15" },
  { label: '10"', desc: "Serves 20–25" },
  { label: "2-Tier", desc: "Serves 30+" },
];

const flavors = ["Vanilla Bean", "Belgian Chocolate", "Red Velvet", "Strawberry", "Lemon", "Pistachio Rose"];

function CustomCake() {
  const [size, setSize] = useState(sizes[1].label);
  const [flavor, setFlavor] = useState(flavors[0]);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[44vh] xs:h-[50vh] min-h-[320px] sm:min-h-[380px] overflow-hidden">
        <img src={customBg} alt="Custom cakes" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/70 via-cocoa/20 to-transparent" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 flex items-end pb-8 sm:pb-12">
          <div className="text-cream max-w-2xl">
            <p className="text-[10px] xs:text-xs tracking-[0.3em] uppercase mb-3 sm:mb-4 opacity-90">Custom Orders</p>
            <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">Design your dream cake 🎂</h1>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="space-y-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-rose-gold mb-3">Step 01</p>
            <h2 className="font-serif text-3xl text-cocoa mb-5">Choose a size</h2>
            <div className="grid grid-cols-2 gap-3">
              {sizes.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSize(s.label)}
                  className={`p-5 rounded-2xl text-left transition ${
                    size === s.label
                      ? "bg-cocoa text-cocoa-foreground"
                      : "border border-border hover:border-cocoa"
                  }`}
                >
                  <p className="font-serif text-2xl">{s.label}</p>
                  <p className="text-xs opacity-80 mt-1">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-rose-gold mb-3">Step 02</p>
            <h2 className="font-serif text-3xl text-cocoa mb-5">Pick a flavor</h2>
            <div className="flex flex-wrap gap-2">
              {flavors.map((f) => (
                <button
                  key={f}
                  onClick={() => setFlavor(f)}
                  className={`px-5 py-2.5 rounded-full text-sm transition ${
                    flavor === f ? "bg-cocoa text-cocoa-foreground" : "border border-border hover:border-cocoa"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-rose-gold mb-3">Step 03</p>
            <h2 className="font-serif text-3xl text-cocoa mb-5">Personalise it</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={50}
                placeholder="Message on cake (e.g. Happy Birthday Iz!)"
                className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-cocoa transition"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-cocoa transition"
              />
              <label className="flex items-center justify-center gap-3 w-full bg-card border-2 border-dashed border-border rounded-2xl px-5 py-8 text-sm text-muted-foreground hover:border-cocoa hover:text-cocoa cursor-pointer transition">
                <Upload className="w-5 h-5" />
                Upload reference image (optional)
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start space-y-6">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-muted shadow-elegant">
            <img src={productCustom} alt="Custom cake preview" className="w-full h-full object-cover" />
          </div>
          <div className="bg-cream rounded-3xl p-8 shadow-soft">
            <h3 className="font-serif text-2xl text-cocoa mb-5">Your order</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Size</dt><dd className="text-cocoa font-medium">{size}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Flavor</dt><dd className="text-cocoa font-medium">{flavor}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Message</dt><dd className="text-cocoa font-medium truncate max-w-[60%]">{message || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="text-cocoa font-medium">{date || "Pick a date"}</dd></div>
            </dl>
            <button className="mt-6 w-full bg-cocoa text-cocoa-foreground py-4 rounded-full font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-2">
              Submit custom order <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Our team will confirm pricing within 2 hours.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
