import { useSyncExternalStore } from "react";
import { products as defaultProducts, type Product } from "@/lib/products";
import heroCake from "@/assets/iz-hero-cake.jpg";
import heroPastries from "@/assets/iz-macarons.jpg";
import heroInterior from "@/assets/iz-interior.jpg";
import { idbGet, idbSet } from "@/lib/cms-storage";
import {
  getCmsState,
  removeOrderRecord,
  removeProductRecord,
  removeSlideRecord,
  saveOrderRecord,
  saveProductRecord,
  saveSettingsRecord,
  saveSlideOrder,
  saveSlideRecord,
  updateOrderStatusRecord,
} from "@/lib/cms.functions";

export type HeroSlide = {
  id: string;
  image: string;
  /** Optional background video URL (mp4/webm). When set, plays muted+looped over the image. */
  video?: string;
  eyebrow: string;
  title: string;
  sub: string;
};

export type Order = {
  id: string;
  createdAt: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  city: string;
  notes: string;
  payment: string;
  items: { name: string; qty: number; price: number; size: string; flavor: string }[];
  subtotal: number;
  delivery: number;
  total: number;
  status: "new" | "preparing" | "delivered" | "cancelled";
};

export type SiteSettings = {
  announcements: string[];
  contact: {
    address: string;
    phone: string;
    hours: string;
    email: string;
    secondaryEmail: string;
  };
  footerTagline: string;
  socials: { instagram: string; facebook: string; email: string };
};

type State = {
  products: Product[];
  slides: HeroSlide[];
  settings: SiteSettings;
  orders: Order[];
};

const STORAGE_KEY = "iz-cms-v1";
const ADMIN_TOKEN_KEY = "iz-admin-token-v1";

const defaultSlides: HeroSlide[] = [
  {
    id: "s1",
    image: heroCake,
    eyebrow: "Signature Collection",
    title: "Where Pâtisserie\nMeets Poetry.",
    sub: "Hand-crafted French desserts, baked fresh each morning. A Mirpur landmark since 2023.",
  },
  {
    id: "s2",
    image: heroInterior,
    eyebrow: "Visit the Café",
    title: "A Cosy Corner of\nVictorian Charm.",
    sub: "Velvet seating, golden mirrors, and the scent of fresh espresso. Mirpur-12, beside Pallabi metro.",
  },
  {
    id: "s3",
    image: heroPastries,
    eyebrow: "New This Season",
    title: "Pastel Macarons\nin Every Hue.",
    sub: "Delicate French shells, silky ganache. Plated like little works of art.",
  },
];

const defaultSettings: SiteSettings = {
  announcements: [
    "✨ Same day delivery available",
    "🍰 Freshly baked every morning",
    "🎁 Complimentary gift wrap on orders over ৳2000",
    "💌 Personalised notes for every cake",
  ],
  contact: {
    address: "House 12, Road 5, Banani\nDhaka, Bangladesh",
    phone: "+880 1700 000 000",
    hours: "Daily 9am — 10pm",
    email: "hello@izpatisserie.com",
    secondaryEmail: "orders@izpatisserie.com",
  },
  footerTagline:
    "Crafting moments of pure indulgence through artisanal baking and high-end culinary artistry.",
  socials: {
    instagram: "https://www.instagram.com/izpatisserieandcafe/",
    facebook: "https://www.facebook.com/IZPatisserieandCafe/",
    email: "mailto:hello@izpatisserie.com",
  },
};

const defaultState: State = {
  products: defaultProducts,
  slides: defaultSlides,
  settings: defaultSettings,
  orders: [],
};


function mergeSettings(parsed: Partial<SiteSettings> | null | undefined): SiteSettings {
  return { ...defaultSettings, ...(parsed || {}) };
}

/** Build a full state object. Empty arrays are KEPT empty when `useDefaultsForEmpty` is false. */
function buildState(
  parsed: Partial<State> | null | undefined,
  useDefaultsForEmpty: boolean,
): State {
  const products = parsed?.products;
  const slides = parsed?.slides;
  return {
    products: products && products.length > 0 ? products : useDefaultsForEmpty ? defaultProducts : [],
    slides: slides && slides.length > 0 ? slides : useDefaultsForEmpty ? defaultSlides : [],
    settings: mergeSettings(parsed?.settings),
    orders: parsed?.orders || [],
  };
}

function loadInitialSync(): State {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<State> & { _hydrated?: boolean };
    // If we've previously hydrated from cloud, trust the cache exactly (even
    // if it's empty). Otherwise show defaults so the page isn't blank.
    return buildState(parsed, !parsed._hydrated);
  } catch {
    return defaultState;
  }
}

let state: State = loadInitialSync();
let cloudHydrated = false;
const listeners = new Set<() => void>();
let syncPromise: Promise<void> | null = null;
let lastSyncAt = 0;

// Hydrate from IndexedDB (handles large image/video data URLs that exceed
// the localStorage quota). Once hydrated, future writes go to IDB primarily
// with a best-effort localStorage mirror for fast initial paint.
if (typeof window !== "undefined") {
  void idbGet<State & { _hydrated?: boolean }>(STORAGE_KEY).then((stored) => {
    if (!stored) return;
    // If IDB says we previously synced from cloud, use it verbatim.
    state = buildState(stored, !(stored as any)._hydrated);
    cloudHydrated = !!(stored as any)._hydrated;
    listeners.forEach((l) => l());
  });
}

async function getAdminToken() {
  if (typeof window === "undefined") return null;
  const { data } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getSession());
  return data.session?.access_token || null;
}

async function syncFromCloud(force = false) {
  if (typeof window === "undefined") return;
  if (syncPromise) {
    await syncPromise;
    if (!force) return;
  }
  if (!force && lastSyncAt && Date.now() - lastSyncAt < 30_000) return;
  syncPromise = syncFromCloudInternal().finally(() => {
    lastSyncAt = Date.now();
    syncPromise = null;
  });
  return syncPromise;
}

async function syncFromCloudInternal() {
  try {
    const adminToken = await getAdminToken();
    const remote = await getCmsState({ data: { adminToken } });
    const cloudIsEmpty = remote.products.length === 0 && remote.slides.length === 0;

    // First-time seed: cloud is completely empty AND we're admin → seed defaults
    // to the cloud so visitors see something. Run only once.
    if (cloudIsEmpty && adminToken) {
      await Promise.all([
        ...defaultProducts.map((product) => saveProductRecord({ data: { adminToken, product } })),
        ...defaultSlides.map((slide, sortOrder) =>
          saveSlideRecord({ data: { adminToken, slide, sortOrder } }),
        ),
        saveSettingsRecord({ data: { adminToken, settings: defaultSettings } }),
      ]);
      const seeded = await getCmsState({ data: { adminToken } });
      state = buildState({ ...seeded, settings: seeded.settings || undefined }, false);
      cloudHydrated = true;
      await persistNow();
      listeners.forEach((l) => l());
      return;
    }

    // Cloud is the source of truth. Use it verbatim — even if some lists are
    // empty (the admin may have intentionally removed everything).
    state = buildState(
      { ...remote, settings: remote.settings || undefined },
      // Only fall back to defaults when cloud is genuinely uninitialised
      // (both products and slides empty AND no settings row).
      cloudIsEmpty && !remote.settings,
    );
    cloudHydrated = true;
    await persistNow();
    listeners.forEach((l) => l());
  } catch {
    // Network failure: keep whatever we already have. Do not destructively
    // overwrite local state on error.
  }
}

if (typeof window !== "undefined") {
  void syncFromCloud();
}

async function persistNow() {
  if (typeof window === "undefined") return;
  const payload = { ...state, _hydrated: cloudHydrated };
  await idbSet(STORAGE_KEY, payload);
  // Mirror a lightweight copy to localStorage for synchronous initial paint.
  // Strip out heavy data URLs (>200KB) so we never blow the quota.
  try {
    const slim = {
      ...state,
      _hydrated: cloudHydrated,
      products: state.products.map((p) => (isHeavy(p.image) ? { ...p, image: "" } : p)),
      slides: state.slides.map((s) => ({
        ...s,
        image: isHeavy(s.image) ? "" : s.image,
        video: isHeavy(s.video) ? undefined : s.video,
      })),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* localStorage quota — IDB still has the full copy */
  }
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function persist() {
  if (typeof window === "undefined") return;
  // Debounce to avoid hammering IDB on rapid edits.
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => void persistNow(), 120);
}

function isHeavy(url?: string) {
  return !!url && url.startsWith("data:") && url.length > 200_000;
}

function setState(updater: (s: State) => State) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

const serverSnapshot: State = defaultState;

export const cmsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  },
  getServerSnapshot() {
    return serverSnapshot;
  },
  refreshFromCloud() {
    lastSyncAt = 0;
    void syncFromCloud(true);
  },

  // Products
  async upsertProduct(p: Product) {
    setState((s) => {
      const exists = s.products.some((x) => x.slug === p.slug);
      return {
        ...s,
        products: exists ? s.products.map((x) => (x.slug === p.slug ? p : x)) : [p, ...s.products],
      };
    });
    await persistNow();
    const adminToken = await getAdminToken();
    await saveProductRecord({ data: { adminToken, product: p } });
    await syncFromCloud(true);
  },
  removeProduct(slug: string) {
    setState((s) => ({ ...s, products: s.products.filter((p) => p.slug !== slug) }));
    void getAdminToken().then(adminToken => removeProductRecord({ data: { adminToken, slug } }));
  },

  // Slides
  async upsertSlide(slide: HeroSlide) {
    let sortOrder = 0;
    setState((s) => {
      const exists = s.slides.some((x) => x.id === slide.id);
      sortOrder = exists ? s.slides.findIndex((x) => x.id === slide.id) : s.slides.length;
      return {
        ...s,
        slides: exists
          ? s.slides.map((x) => (x.id === slide.id ? slide : x))
          : [...s.slides, slide],
      };
    });
    await persistNow();
    const adminToken = await getAdminToken();
    await saveSlideRecord({ data: { adminToken, slide, sortOrder } });
    await syncFromCloud(true);
  },
  removeSlide(id: string) {
    setState((s) => ({ ...s, slides: s.slides.filter((x) => x.id !== id) }));
    void getAdminToken().then(adminToken => removeSlideRecord({ data: { adminToken, id } }));
  },
  moveSlide(id: string, dir: -1 | 1) {
    let ids: string[] = [];
    setState((s) => {
      const idx = s.slides.findIndex((x) => x.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= s.slides.length) return s;
      const arr = [...s.slides];
      const [item] = arr.splice(idx, 1);
      arr.splice(next, 0, item);
      ids = arr.map((x) => x.id);
      return { ...s, slides: arr };
    });
    if (ids.length) void getAdminToken().then(adminToken => saveSlideOrder({ data: { adminToken, ids } }));
  },

  // Settings
  updateSettings(patch: Partial<SiteSettings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    void getAdminToken().then(adminToken => saveSettingsRecord({ data: { adminToken, settings: state.settings } }));
  },

  // Orders
  addOrder(o: Order) {
    setState((s) => ({ ...s, orders: [o, ...s.orders] }));
    void saveOrderRecord({ data: { order: o } });
  },
  setOrderStatus(id: string, status: Order["status"]) {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
    void getAdminToken().then(adminToken => updateOrderStatusRecord({ data: { adminToken, id, status } }));
  },
  removeOrder(id: string) {
    setState((s) => ({ ...s, orders: s.orders.filter((o) => o.id !== id) }));
    void getAdminToken().then(adminToken => removeOrderRecord({ data: { adminToken, id } }));
  },

  resetAll() {
    setState(() => defaultState);
  },
};

export function useCms() {
  return useSyncExternalStore(cmsStore.subscribe, cmsStore.getSnapshot, cmsStore.getServerSnapshot);
}

// File -> dataURL helper for image uploads in admin
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
