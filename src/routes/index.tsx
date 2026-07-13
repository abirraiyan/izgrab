import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Clock, Flame, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { useCms } from "@/lib/cms-store";
import { SEO } from "@/components/seo";
import { getCloudinaryUrl } from "@/lib/cloudinary";

const izCroissant = '{"public_id":"iz-grab/products/gupfdi5jqjnh3mfmmicq","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983353/iz-grab/products/gupfdi5jqjnh3mfmmicq.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const izCremeBrulee = '{"public_id":"iz-grab/products/wvdzrvlxuarvt2xe5y9v","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983354/iz-grab/products/wvdzrvlxuarvt2xe5y9v.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const izLatte = '{"public_id":"iz-grab/products/xdymybbgygjpnm1snt8b","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983352/iz-grab/products/xdymybbgygjpnm1snt8b.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const izPecanTart = '{"public_id":"iz-grab/products/tposaf26ixv0rzbyf6ix","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983354/iz-grab/products/tposaf26ixv0rzbyf6ix.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';

// Stylized Vector Map of Dhaka with animations
function DeliveryCoverageMap({
  areas,
  matchedArea,
}: {
  areas: any[];
  matchedArea?: string;
}) {
  return (
    <div className="relative w-full aspect-[4/3.2] max-h-[220px] sm:max-h-[260px] lg:max-h-[210px] xl:max-h-[240px] mx-auto bg-cream/10 dark:bg-cocoa/15 border border-cocoa/5 rounded-2xl overflow-hidden p-1.5">
      <div className="absolute top-2 right-2 text-[9px] font-mono text-cocoa/40 dark:text-cream/40 flex items-center gap-1 uppercase tracking-wider select-none">
        <span>N</span>
        <div className="w-1 h-1 bg-rose-gold rounded-full animate-pulse" />
      </div>

      <svg
        viewBox="0 0 360 400"
        className="w-full h-full text-cocoa dark:text-cream fill-current"
        aria-label="Dhaka delivery coverage map"
      >
        <defs>
          <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.05" />
          </pattern>
        </defs>

        {/* Grid pattern background */}
        <rect width="100%" height="100%" fill="url(#mapGrid)" />

        {/* River paths (decorative) */}
        <motion.path
          d="M 10 390 Q 150 350 200 370 T 350 390"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.08"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.path
          d="M 30 10 Q 80 180 80 340"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.06"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        {/* Shaded Delivery Area Region */}
        <motion.polygon
          points="130,50 280,90 320,180 290,320 200,380 90,320 60,180"
          fill="var(--color-cocoa)"
          fillOpacity="0.07"
          stroke="var(--color-rose-gold)"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Nodes and Labels */}
        {areas.map((area) => {
          const isMatched = matchedArea && area.name.toLowerCase() === matchedArea.toLowerCase();
          const isKitchen = area.name.toLowerCase() === "banani"; // Banani is central kitchen
          const isActive = !matchedArea || isMatched;

          return (
            <g
              key={area.id}
              className="transition-opacity duration-300"
              style={{ opacity: isActive ? 1 : 0.2 }}
            >
              {/* Pulsing ring for searched area */}
              {isMatched && (
                <circle
                  cx={area.map_x}
                  cy={area.map_y}
                  r="14"
                  fill="none"
                  stroke="var(--color-rose-gold)"
                  strokeWidth="1.5"
                  className="animate-ping"
                />
              )}

              {/* Node Dot */}
              <circle
                cx={area.map_x}
                cy={area.map_y}
                r={isMatched ? "5.5" : isKitchen ? "4.5" : "3"}
                fill={isMatched ? "var(--color-rose-gold)" : isKitchen ? "var(--color-cocoa)" : "var(--color-rose-gold)"}
                stroke={isKitchen ? "var(--color-rose-gold)" : "var(--color-cream)"}
                strokeWidth={isKitchen ? "1.5" : "1"}
                className={`transition-all duration-300 ${isMatched ? "drop-shadow-[0_0_8px_var(--color-rose-gold)]" : ""}`}
              />

              {/* Node text label */}
              <text
                x={area.map_x}
                y={area.map_y - 7}
                textAnchor="middle"
                fontSize={isMatched ? "9px" : "7px"}
                fontWeight={isMatched || isKitchen ? "bold" : "normal"}
                className="font-sans select-none pointer-events-none fill-cocoa dark:fill-cream transition-all duration-300"
                opacity={isMatched || isKitchen ? 1 : 0.6}
              >
                {area.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function Home() {
  const { products, slides, settings, deliveryAreas, categories } = useCms();
  const activeCategories = categories.filter((c) => c.is_active && c.show_on_homepage && !c.is_archived);
  const igUrl = settings.socials.instagram || "https://www.instagram.com/izpatisserieandcafe/";
  const igHandle = (() => {
    try {
      const u = new URL(igUrl);
      const h = u.pathname.replace(/\//g, "");
      return h ? `@${h}` : "@izpatisserieandcafe";
    } catch {
      return "@izpatisserieandcafe";
    }
  })();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setActive((p) => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);
  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [slides.length, active]);

  // Hot picks carousel
  const railRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 720), behavior: "smooth" });
  };

  // Delivery Coverage Area Checker state & validation
  const [searchQuery, setSearchQuery] = useState("");
  const [validationResult, setValidationResult] = useState<{
    status: "success" | "fail";
    message: string;
    matchedArea?: string;
  } | null>(null);

  const handleCheckArea = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setValidationResult({
        status: "fail",
        message: "Please enter your neighborhood to check zone.",
      });
      return;
    }

    const activeZones = (deliveryAreas || []).filter((a) => a.active);
    const matched = activeZones.find((area) =>
      area.name.toLowerCase() === q ||
      area.synonyms.some((syn) => syn.toLowerCase() === q || syn.toLowerCase().includes(q) || q.includes(syn.toLowerCase()))
    );

    const cov = settings.deliveryCoverage || {
      successMessage: "✓ Great News! We currently deliver to {{Area}}",
      failureMessage: "Delivery to this location is coming soon. We're expanding rapidly across Bangladesh.",
    };

    if (matched) {
      const msg = cov.successMessage.replace("{{Area}}", matched.name);
      setValidationResult({
        status: "success",
        message: msg,
        matchedArea: matched.name,
      });
    } else {
      setValidationResult({
        status: "fail",
        message: cov.failureMessage,
      });
    }
  };

  const covSettings = settings.deliveryCoverage || {
    title: "We Deliver Inside Dhaka City",
    subtitle: "Same-Day Gourmet Delivery",
    description: "Enjoy same-day delivery of handcrafted cakes, gourmet pastries, artisan desserts and café favourites across Dhaka, freshly baked every morning and delivered with care.",
    statusBadgeText: "Currently Delivering",
    buttonText: "Check Area",
    placeholder: "Enter your area",
    successMessage: "✓ Great News! We currently deliver to {{Area}}",
    failureMessage: "Delivery to this location is coming soon. We're expanding rapidly across Bangladesh.",
    deliveryHours: "9:00 AM – 9:00 PM",
    features: [
      { title: "Same Day Delivery", description: "Freshly baked and delivered on the same day." },
      { title: "Delivery Hours", description: "9:00 AM – 9:00 PM" },
      { title: "Fresh Every Morning", description: "Freshly baked daily using premium ingredients." }
    ]
  };

  const featureIcons = [Sparkles, Clock, Flame];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="IZ Patisserie & Cafe — Luxury Desserts, Made Fresh"
        description="Boutique patisserie crafting elegant cakes, brownies, macarons and gift boxes. Same-day delivery & custom orders."
      />
      <Navbar />

      {/* HERO SECTION - PREMIUM SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mx-2 xs:mx-3 sm:mx-6 mt-2 xs:mt-3 sm:mt-4 lg:h-[65vh] lg:min-h-[580px] lg:max-h-[680px]">
        {/* LEFT COLUMN: HERO CAROUSEL (60%) */}
        <section className="lg:col-span-3 h-[450px] xs:h-[480px] sm:h-[550px] lg:h-full relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-soft">
          {slides.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === active ? 1 : 0 }}
              aria-hidden={i !== active}
            >
              {s.video ? (
                <video
                  src={getCloudinaryUrl(s.video)}
                  poster={getCloudinaryUrl(s.image) || undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={i === 0 ? "auto" : "metadata"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={getCloudinaryUrl(s.image)}
                  alt={s.title}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "low"}
                  decoding="async"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-cocoa/70 via-cocoa/25 sm:via-cocoa/20 to-transparent" />
            </div>
          ))}

          {slides.length > 0 && (
            <div className="relative h-full px-4 xs:px-6 sm:px-10 lg:px-14 flex items-end sm:items-center pb-8 xs:pb-10 sm:pb-0">
              <div className="max-w-[88%] xs:max-w-md text-cocoa-foreground">
                <p
                  key={`eyebrow-${active}`}
                  className="text-[10px] tracking-[0.32em] uppercase mb-3 opacity-90 animate-[fade-up_0.6s_ease-out]"
                >
                  {slides[active]?.eyebrow}
                </p>
                <h1
                  key={`title-${active}`}
                  className="font-serif text-[1.6rem] xs:text-3xl sm:text-4xl lg:text-5xl leading-[1.05] whitespace-pre-line animate-[fade-up_0.7s_ease-out]"
                >
                  {slides[active]?.title}
                </h1>
                <p
                  key={`sub-${active}`}
                  className="mt-3 text-xs sm:text-sm max-w-sm opacity-90 animate-[fade-up_0.8s_ease-out] leading-relaxed"
                >
                  {slides[active]?.sub}
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1.5 bg-cream text-cocoa px-5 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-blush transition-all"
                  >
                    Shop Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Slide dots */}
          <div className="absolute bottom-6 right-6 sm:right-10 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === active ? "w-10 bg-cream" : "w-1.5 bg-cream/50"
                }`}
              />
            ))}
          </div>
        </section>

        {/* RIGHT COLUMN: PREMIUM DELIVERY COVERAGE CARD (40%) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 bg-cream/35 dark:bg-cocoa/10 border border-cocoa/10 dark:border-cream/10 rounded-2xl sm:rounded-3xl p-5 xs:p-6 sm:p-7 flex flex-col justify-between shadow-soft lg:h-full lg:min-h-0 overflow-y-auto"
        >
          {/* Header Row */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-xs font-semibold tracking-wide border border-emerald-100 dark:border-emerald-900/50">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                {covSettings.statusBadgeText}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-cocoa/50 dark:text-cream/50 font-medium">
                {covSettings.deliveryHours}
              </span>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl xl:text-[1.65rem] text-cocoa dark:text-cream font-bold leading-tight mb-1.5">
              {covSettings.title}
            </h2>
            <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
              {covSettings.description}
            </p>
          </div>

          {/* Interactive SVG Dhaka Map */}
          <DeliveryCoverageMap
            areas={deliveryAreas || []}
            matchedArea={validationResult?.status === "success" ? validationResult.matchedArea : undefined}
          />

          {/* Delivery Area Checker Form */}
          <div>
            <form onSubmit={handleCheckArea} className="relative flex items-center gap-2">
              <input
                type="text"
                placeholder={covSettings.placeholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) setValidationResult(null);
                }}
                className="w-full bg-background/80 border border-border focus:border-rose-gold/60 focus:ring-1 focus:ring-rose-gold/60 rounded-full px-4 py-2.5 text-xs sm:text-sm font-sans text-foreground placeholder:text-foreground/40 outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-cocoa text-cream px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-rose-gold hover:text-cocoa transition-all duration-300 shadow-soft shrink-0"
              >
                {covSettings.buttonText}
              </button>
            </form>

            {/* Validation Feedback Message Container (Fixed min-height to prevent layout shift) */}
            <div className="min-h-[38px] flex items-center justify-start mt-1 px-1">
              <AnimatePresence mode="wait">
                {validationResult && (
                  <motion.div
                    key={validationResult.message}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`flex items-start gap-2 text-xs font-semibold leading-normal ${
                      validationResult.status === "success"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    {validationResult.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    )}
                    <span>
                      {validationResult.status === "success" ? (
                        <>
                          {validationResult.message}
                          <span className="block text-[10px] text-muted-foreground font-medium mt-0.5">
                            Estimated delivery: 60–90 minutes
                          </span>
                        </>
                      ) : (
                        validationResult.message
                      )}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Premium features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2.5 border-t border-cocoa/10 dark:border-cream/10 pt-3">
            {covSettings.features.map((feat, i) => {
              const Icon = featureIcons[i] || Sparkles;
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-2.5 p-2 rounded-2xl bg-cream/45 dark:bg-cocoa/20 border border-cocoa/5 dark:border-cream/5 hover:border-rose-gold/20 hover:shadow-soft transition-all duration-300"
                >
                  <div className="w-7 h-7 rounded-full bg-cream dark:bg-cocoa/40 flex items-center justify-center text-rose-gold shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-cocoa dark:text-cream leading-tight mb-0.5 truncate">{feat.title}</h4>
                    <p className="text-[9px] sm:text-[10px] text-foreground/75 leading-tight">{feat.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* CATEGORIES — editorial row */}
      {activeCategories.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {activeCategories.map((c) => (
              <Link
                key={c.slug}
                to={`/shop?category=${c.slug}`}
                className="group flex items-center justify-center rounded-2xl bg-cream border border-cocoa/10 aspect-[4/5] shadow-soft hover:bg-cocoa hover:border-cocoa hover:shadow-md transition-all duration-300"
              >
                <span className="text-center font-serif text-base sm:text-lg text-cocoa group-hover:text-cream font-medium tracking-wide px-4">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* HOT PICKS — horizontal carousel */}
      <section className="bg-cream/40 mt-12 sm:mt-16 py-14 sm:py-20 border-y border-border/60">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8 gap-6">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl text-cocoa leading-tight">
                The Week's Hot Picks
              </h2>
              <p className="text-sm text-foreground/65 mt-2">
                Hand-selected favourites for the sweet connoisseur.
              </p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scrollBy(-1)}
                aria-label="Previous"
                className="w-10 h-10 rounded-full border border-cocoa/20 bg-cream/60 text-cocoa hover:bg-cocoa hover:text-cocoa-foreground transition flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollBy(1)}
                aria-label="Next"
                className="w-10 h-10 rounded-full border border-cocoa/20 bg-cream/60 text-cocoa hover:bg-cocoa hover:text-cocoa-foreground transition flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={railRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 sm:mx-0 px-4 sm:px-0 pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {products.map((p) => (
              <div key={p.slug} className="snap-start shrink-0 w-[68%] sm:w-[42%] lg:w-[23.5%]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-cocoa">A Sweet Impression</h2>
          <div className="flex justify-center gap-1 mt-3 text-rose-gold text-sm">
            {Array.from({ length: 5 }).map((_, k) => (
              <span key={k}>★</span>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              name: "Eleanor Vance",
              role: "Verified Order",
              text: "The texture of the Silk Cake was unlike anything I've ever tasted. It truly felt like a luxury experience delivered to my door.",
            },
            {
              name: "Julian Wright",
              role: "Custom Order",
              text: "We ordered a custom wedding cake and IZ Patisserie exceeded every expectation. The design was breathtaking and the taste even better.",
            },
            {
              name: "Sarah Jenkins",
              role: "Gift Recipient",
              text: "Perfect for gifts! The packaging is so elegant and the macarons stayed perfectly crisp. My go-to for client thank yous.",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-7 border border-border/60 hover:shadow-soft transition-all"
            >
              <p className="text-sm text-foreground/75 leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blush/70 flex items-center justify-center font-serif text-cocoa text-sm">
                  {t.name[0]}
                </div>
                <div className="text-xs">
                  <p className="font-medium text-cocoa text-sm">{t.name}</p>
                  <p className="text-muted-foreground tracking-wider uppercase text-[10px] mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-cocoa/60 mb-1">Follow Us</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-cocoa">{igHandle}</h2>
          </div>
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-cocoa/70 hover:text-cocoa transition tracking-wide"
          >
            View Profile →
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[izCroissant, izCremeBrulee, izPecanTart, izLatte].map((img, i) => (
            <a
              key={i}
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-2xl overflow-hidden group bg-muted"
            >
              <img
                src={getCloudinaryUrl(img, { width: 300, height: 300 })}
                alt="IZ Patisserie Instagram"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-cocoa/0 group-hover:bg-cocoa/40 transition flex items-center justify-center">
                <span className="text-cream text-xs font-medium opacity-0 group-hover:opacity-100 transition tracking-wide">
                  View on Instagram
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
