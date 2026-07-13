import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, ArrowRight, Sparkle } from "lucide-react";
import izLogo from "@/assets/iz-logo.svg";
import { useCms } from "@/lib/cms-store";

export function Footer() {
  const { settings } = useCms();
  return (
    <footer className="bg-cream border-t border-border mt-8">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-14 grid gap-10 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <img
            src={izLogo}
            alt="IZ Patisserie & Cafe"
            width={190}
            height={194}
            loading="lazy"
            decoding="async"
            className="h-[92px] sm:h-[104px] w-auto mb-4 object-contain"
          />
          <p className="text-sm text-foreground/70 leading-relaxed max-w-xs">
            {settings.footerTagline}
          </p>
          <div className="flex gap-2 mt-5">
            {[
              { Icon: Instagram, href: settings.socials.instagram, label: "Instagram" },
              { Icon: Facebook, href: settings.socials.facebook, label: "Facebook" },
              { Icon: Mail, href: settings.socials.email, label: "Email" },
            ].map(({ Icon, href, label }, i) => (
              <a
                key={i}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="w-9 h-9 rounded-full border border-cocoa/15 flex items-center justify-center text-cocoa hover:bg-cocoa hover:text-cocoa-foreground transition"
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.22em] uppercase text-cocoa/60 mb-4">Experience</h4>
          <ul className="space-y-2.5 text-sm text-foreground/75">
            <li>
              <Link to="/shop" className="hover:text-cocoa">
                Shop All
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-cocoa">
                Seasonal Menu
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-cocoa">
                Our Story
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-cocoa">
                The Gallery
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.22em] uppercase text-cocoa/60 mb-4">Support</h4>
          <ul className="space-y-2.5 text-sm text-foreground/75">
            <li>
              <a href="#" className="hover:text-cocoa">
                Shipping & Returns
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-cocoa">
                Wholesale
              </a>
            </li>
            <li>
              <Link to="/contact" className="hover:text-cocoa">
                Contact Us
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-cocoa">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.22em] uppercase text-cocoa/60 mb-4">
            Stay Inspired
          </h4>
          <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
            Join our mailing list for secret drops and seasonal previews.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Email Address"
              className="flex-1 bg-card border border-cocoa/15 rounded-full px-4 py-2.5 text-sm placeholder:text-foreground/40 focus:outline-none focus:border-cocoa/50"
            />
            <button
              aria-label="Subscribe"
              className="bg-cocoa text-cocoa-foreground w-10 h-10 shrink-0 rounded-full flex items-center justify-center hover:opacity-90 transition"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <p className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>
              © {new Date().getFullYear()} IZ Patisserie & Cafe. Crafted with skill and visuals.
            </span>
            {settings.developerCredit?.enabled && (() => {
              const text = settings.developerCredit.text || "Built by Xceptionist";
              const match = text.match(/^(Built\s+by\s+)?(.*)$/i);
              const prefix = match?.[1] || "Built by ";
              const linkText = match?.[2] || "Xceptionist";
              return (
                <span className="text-[11px] text-muted-foreground/80">
                  {" | "}
                  {prefix}
                  <a
                    href={settings.developerCredit.url || "https://xceptionist.com/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cocoa transition-colors underline underline-offset-2 font-medium"
                  >
                    {linkText}
                  </a>
                </span>
              );
            })()}
            <Link
              to="/admin"
              aria-label="Admin panel"
              title="Admin"
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-muted-foreground/40 hover:text-cocoa hover:bg-cocoa/5 transition opacity-60 hover:opacity-100"
            >
              <Sparkle className="w-3 h-3" />
            </Link>
          </p>
          <div className="flex gap-5 tracking-[0.2em] uppercase">
            <a href="#" className="hover:text-cocoa">
              FaceBook
            </a>
            <a href="#" className="hover:text-cocoa">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
