import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCms } from "@/lib/cms-store";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — IZ Patisserie" },
      { name: "description", content: "Get in touch with IZ Patisserie for orders, custom cakes, and inquiries." },
      { property: "og:title", content: "Contact — IZ Patisserie" },
      { property: "og:description", content: "We'd love to hear from you." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { settings } = useCms();
  const info = [
    { icon: MapPin, t: "Visit us", d: settings.contact.address },
    { icon: Phone, t: "Call us", d: `${settings.contact.phone}\n${settings.contact.hours}` },
    { icon: Mail, t: "Email us", d: `${settings.contact.email}\n${settings.contact.secondaryEmail}` },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-rose-gold mb-4">Say hello</p>
          <h1 className="font-serif text-4xl xs:text-5xl sm:text-6xl text-cocoa leading-[1.05]">We'd love to hear from you</h1>
          <p className="mt-5 text-foreground/70">Questions, custom orders, or just to say hi — we read every message.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 max-w-5xl mx-auto">
          <form className="space-y-4">
            <input type="text" placeholder="Your name" className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-cocoa" />
            <input type="email" placeholder="Email" className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-cocoa" />
            <input type="text" placeholder="Subject" className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-cocoa" />
            <textarea rows={6} placeholder="Your message" className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-cocoa resize-none" />
            <button type="button" className="w-full bg-cocoa text-cocoa-foreground py-4 rounded-full font-medium hover:opacity-90 transition">
              Send message
            </button>
          </form>

          <div className="space-y-6">
            {info.map(({ icon: Icon, t, d }, i) => (
              <div key={i} className="flex gap-5 p-6 bg-cream/60 rounded-3xl">
                <div className="w-12 h-12 rounded-full bg-cocoa text-cocoa-foreground flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-cocoa mb-1">{t}</h3>
                  <p className="text-sm text-foreground/70 whitespace-pre-line leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
