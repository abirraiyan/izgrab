import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { HeroSlide, Order, SiteSettings } from "@/lib/cms-store";
import type { Product } from "@/lib/products";
import fs from "fs";
import path from "path";

type CmsStatePayload = {
  products: Product[];
  slides: HeroSlide[];
  settings: SiteSettings | null;
  orders: Order[];
};

function loadEnvFallback() {
  try {
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split(/\r?\n/).forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          if (!process.env[match[1]]) {
            process.env[match[1]] = value.trim();
          }
        }
      });
    }
  } catch (e) {
    // Ignore fallback errors
  }
}

loadEnvFallback();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "izadmin2025";
const SESSION_DAYS = 14;
const SIGNED_URL_SECONDS = 60 * 60 * 24 * 7;

function db() {
  return supabaseAdmin as any;
}

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function newToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isAdminToken(token?: string | null) {
  if (!token) return false;
  try {
    const { data: { user }, error: authError } = await db().auth.getUser(token);
    if (authError || !user?.email) return false;

    const { data: admin, error: dbError } = await db()
      .from("admin_users")
      .select("id")
      .eq("email", user.email)
      .single();

    return !dbError && !!admin;
  } catch {
    return false;
  }
}

async function requireAdmin(token?: string | null) {
  if (!(await isAdminToken(token))) throw new Error("Admin access required");
}

function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(",");
  const contentType = header.match(/^data:(.*?);base64$/)?.[1] || "application/octet-stream";
  const binary = atob(base64 || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return { contentType, bytes };
}

function extFromType(contentType: string) {
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("mp4")) return "mp4";
  return contentType.startsWith("video/") ? "mp4" : "jpg";
}

async function storeDataUrl(dataUrl: string, folder: string) {
  const { contentType, bytes } = dataUrlToBlob(dataUrl);
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extFromType(contentType)}`;
  const { error } = await db().storage.from("cms-media").upload(path, bytes, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return `cms-media/${path}`;
}

async function persistMedia(value: string | undefined, folder: string) {
  if (!value) return value;
  // New upload — base64 data URL needs to be stored.
  if (value.startsWith("data:")) return storeDataUrl(value, folder);
  // Already a stored reference — keep as is.
  if (value.startsWith("cms-media/")) return value;
  // Resolved Supabase signed URL — extract the underlying object path so we
  // never persist a temporary token in the database.
  const match = value.match(/\/storage\/v1\/object\/(?:sign|public)\/cms-media\/([^?#]+)/);
  if (match) return `cms-media/${match[1]}`;
  // Anything else (external URL, bundled asset path) — leave untouched.
  return value;
}

async function resolveMedia(value: string | null | undefined) {
  if (!value) return "";
  if (!value.startsWith("cms-media/")) return value;
  const path = value.replace(/^cms-media\//, "");
  const { data, error } = await db()
    .storage
    .from("cms-media")
    .createSignedUrl(path, SIGNED_URL_SECONDS);
  return error ? "" : data.signedUrl;
}

function productFromRow(row: any): Product {
  return {
    slug: row.slug,
    name: row.name,
    price: row.price,
    image: row.image,
    video: row.video || undefined,
    category: row.category,
    tag: row.tag || undefined,
    description: row.description,
    ingredients: row.ingredients || "",
    sizes: row.sizes || [],
    flavors: row.flavors || [],
  };
}

function slideFromRow(row: any): HeroSlide {
  return {
    id: row.id,
    image: row.image || "",
    video: row.video || undefined,
    eyebrow: row.eyebrow || "",
    title: row.title,
    sub: row.sub || "",
  };
}

function orderFromRow(row: any): Order {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).getTime(),
    name: row.customer_name,
    phone: row.phone,
    email: row.email || "",
    address: row.address,
    area: row.area || "",
    city: row.city || "",
    notes: row.notes || "",
    payment: row.payment || "cod",
    items: row.items || [],
    subtotal: row.subtotal,
    delivery: row.delivery,
    total: row.total,
    status: row.status,
  };
}

function settingsFromRow(row: any): SiteSettings {
  return {
    announcements: row.announcements || [],
    contact: row.contact || {},
    footerTagline: row.footer_tagline || "",
    socials: row.socials || {},
  };
}

// The legacy loginAdmin function has been removed.
// We now rely entirely on Supabase client-side auth.

export const verifyAdminSession = createServerFn({ method: "POST" })
  .inputValidator((data: { token?: string | null }) => data)
  .handler(async ({ data }) => ({ ok: await isAdminToken(data.token) }));

export const getCmsState = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string | null }) => data)
  .handler(async ({ data }) => {
    const [productsRes, slidesRes, settingsRes] = await Promise.all([
      db().from("cms_products").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
      db().from("cms_hero_slides").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
      db().from("cms_site_settings").select("*").eq("key", "main").maybeSingle(),
    ]);

    const admin = await isAdminToken(data.adminToken);
    const ordersRes = admin
      ? await db().from("ecommerce_orders").select("*").order("created_at", { ascending: false })
      : { data: [] };

    const products = await Promise.all(
      (productsRes.data || []).map(async (row: any) => ({
        ...productFromRow(row),
        image: await resolveMedia(row.image),
        video: row.video ? await resolveMedia(row.video) : undefined,
      })),
    );
    const slides = await Promise.all(
      (slidesRes.data || []).map(async (row: any) => ({
        ...slideFromRow(row),
        image: await resolveMedia(row.image),
        video: row.video ? await resolveMedia(row.video) : undefined,
      })),
    );

    return {
      products,
      slides,
      settings: settingsRes.data ? settingsFromRow(settingsRes.data) : null,
      orders: (ordersRes.data || []).map(orderFromRow),
    } satisfies CmsStatePayload;
  });

export const saveProductRecord = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string | null; product: Product }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.adminToken);
    const image = await persistMedia(data.product.image, "products");
    const video = await persistMedia(data.product.video, "products");
    const { error } = await db().from("cms_products").upsert({
      slug: data.product.slug,
      name: data.product.name,
      price: data.product.price,
      image: image || "",
      video: video || null,
      category: data.product.category,
      tag: data.product.tag || null,
      description: data.product.description,
      ingredients: data.product.ingredients,
      sizes: data.product.sizes,
      flavors: data.product.flavors,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeProductRecord = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string | null; slug: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.adminToken);
    const { error } = await db().from("cms_products").delete().eq("slug", data.slug);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveSlideRecord = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string | null; slide: HeroSlide; sortOrder?: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.adminToken);
    const image = await persistMedia(data.slide.image, "hero");
    const video = await persistMedia(data.slide.video, "hero");
    const { error } = await db().from("cms_hero_slides").upsert({
      id: data.slide.id,
      image: image || "",
      video: video || null,
      eyebrow: data.slide.eyebrow,
      title: data.slide.title,
      sub: data.slide.sub,
      sort_order: data.sortOrder ?? 0,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeSlideRecord = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string | null; id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.adminToken);
    const { error } = await db().from("cms_hero_slides").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveSlideOrder = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string | null; ids: string[] }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.adminToken);
    await Promise.all(
      data.ids.map((id, sort_order) =>
        db().from("cms_hero_slides").update({ sort_order }).eq("id", id),
      ),
    );
    return { ok: true };
  });

export const saveSettingsRecord = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string | null; settings: SiteSettings }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.adminToken);
    const { error } = await db().from("cms_site_settings").upsert({
      key: "main",
      announcements: data.settings.announcements,
      contact: data.settings.contact,
      footer_tagline: data.settings.footerTagline,
      socials: data.settings.socials,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveOrderRecord = createServerFn({ method: "POST" })
  .inputValidator((data: { order: Order }) => data)
  .handler(async ({ data }) => {
    const { error } = await db().from("ecommerce_orders").insert({
      id: data.order.id,
      customer_name: data.order.name,
      phone: data.order.phone,
      email: data.order.email,
      address: data.order.address,
      area: data.order.area,
      city: data.order.city,
      notes: data.order.notes,
      payment: data.order.payment,
      items: data.order.items,
      subtotal: data.order.subtotal,
      delivery: data.order.delivery,
      total: data.order.total,
      status: data.order.status,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateOrderStatusRecord = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string | null; id: string; status: Order["status"] }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.adminToken);
    const { error } = await db().from("ecommerce_orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeOrderRecord = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string | null; id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.adminToken);
    const { error } = await db().from("ecommerce_orders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });