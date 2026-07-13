/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";
import type { HeroSlide, Order, SiteSettings, DeliveryArea } from "@/lib/cms-store";
import type { Product } from "@/lib/products";

type CmsStatePayload = {
  products: Product[];
  slides: HeroSlide[];
  settings: SiteSettings | null;
  orders: Order[];
};

const SIGNED_URL_SECONDS = 60 * 60 * 24 * 7;

function db() {
  return supabase as any;
}

async function isAdminToken(token?: string | null) {
  if (!token) return false;
  try {
    const {
      data: { user },
      error: authError,
    } = await db().auth.getUser(token);
    if (authError || !user?.email) return false;

    const { data: profile, error: dbError } = await db()
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return !dbError && profile && (profile.role === "admin" || profile.role === "super_admin");
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
  // Cloudinary metadata - keep as is
  if (value.startsWith("{")) return value;
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
  if (value.startsWith("{")) return value; // Cloudinary metadata
  if (!value.startsWith("cms-media/")) return value;
  const path = value.replace(/^cms-media\//, "");
  const { data, error } = await db()
    .storage.from("cms-media")
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
    deliveryCoverage: row.delivery_coverage || undefined,
  };
}

export async function verifyAdminSession({ data }: { data: { token?: string | null } }) {
  return { ok: await isAdminToken(data.token) };
}

export async function getCmsState({ data }: { data: { adminToken?: string | null } }) {
  const [productsRes, slidesRes, settingsRes, categoriesRes] = await Promise.all([
    db()
      .from("cms_products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    db()
      .from("cms_hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    db().from("cms_site_settings").select("*").eq("key", "main").maybeSingle(),
    db()
      .from("cms_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  const adminToken = data.adminToken;
  const admin = await isAdminToken(adminToken);
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

  // Fetch delivery areas with dynamic seeding and robust error fallbacks
  let deliveryAreas: DeliveryArea[] = [];
  try {
    const { data: areasData, error: areasError } = await db()
      .from("delivery_areas")
      .select("*")
      .order("display_order", { ascending: true });

    if (areasError) throw areasError;

    if (areasData) {
      if (areasData.length === 0) {
        const defaultAreas = [
          { name: "Gulshan", synonyms: ["gulshan", "gulshan 1", "gulshan 2", "gulsan"], active: true, display_order: 1, map_x: 250, map_y: 210 },
          { name: "Banani", synonyms: ["banani", "banani dohs", "banani-11"], active: true, display_order: 2, map_x: 210, map_y: 200 },
          { name: "Baridhara", synonyms: ["baridhara", "baridhara dohs", "baridara"], active: true, display_order: 3, map_x: 290, map_y: 190 },
          { name: "Uttara", synonyms: ["uttara", "uttara sector", "uttara model town"], active: true, display_order: 4, map_x: 200, map_y: 70 },
          { name: "Mirpur", synonyms: ["mirpur", "mirpur 1", "mirpur 2", "mirpur 10", "mirpur 11", "mirpur 12", "mirpur dohs", "pallabi"], active: true, display_order: 5, map_x: 110, map_y: 180 },
          { name: "Mohammadpur", synonyms: ["mohammadpur", "mohammad pur", "town hall", "adabor"], active: true, display_order: 6, map_x: 100, map_y: 290 },
          { name: "Dhanmondi", synonyms: ["dhanmondi", "dhanmondi r/a", "dhanmondi 32"], active: true, display_order: 7, map_x: 160, map_y: 310 },
          { name: "Bashundhara", synonyms: ["bashundhara", "basundhara", "bashundhara r/a"], active: true, display_order: 8, map_x: 270, map_y: 150 },
          { name: "Tejgaon", synonyms: ["tejgaon", "tejgaon i/a", "kawran bazar", "karwan bazar"], active: true, display_order: 9, map_x: 200, map_y: 280 },
          { name: "Motijheel", synonyms: ["motijheel", "matijheel", "dilkusha"], active: true, display_order: 10, map_x: 250, map_y: 390 },
          { name: "Khilgaon", synonyms: ["khilgaon", "khilgon", "taltola"], active: true, display_order: 11, map_x: 290, map_y: 320 },
          { name: "Badda", synonyms: ["badda", "merul badda", "middle badda", "north badda"], active: true, display_order: 12, map_x: 300, map_y: 240 },
          { name: "Rampura", synonyms: ["rampura", "banasree", "aftabnagar", "aftab nagar"], active: true, display_order: 13, map_x: 290, map_y: 270 },
          { name: "Lalbagh", synonyms: ["lalbagh", "old dhaka", "wari", "sadarghat", "chawkbazar"], active: true, display_order: 14, map_x: 210, map_y: 440 },
          { name: "Mogbazar", synonyms: ["mogbazar", "moghbazar", "shantinagar", "shanti nagar", "malibagh", "kakrail"], active: true, display_order: 15, map_x: 240, map_y: 335 },
          { name: "Farmgate", synonyms: ["farmgate", "farm gate", "indira road", "tejturi bazar"], active: true, display_order: 16, map_x: 180, map_y: 310 },
        ];

        if (admin) {
          await Promise.all(
            defaultAreas.map((area) =>
              db()
                .from("delivery_areas")
                .insert({
                  name: area.name,
                  synonyms: area.synonyms,
                  active: area.active,
                  display_order: area.display_order,
                  map_x: area.map_x,
                  map_y: area.map_y,
                })
            )
          );
          const { data: reloaded } = await db()
            .from("delivery_areas")
            .select("*")
            .order("display_order", { ascending: true });
          if (reloaded) {
            areasData.push(...reloaded);
          }
        } else {
          // Public visitor fallback
          areasData.push(...defaultAreas.map((a, i) => ({ id: `default-${i}`, ...a })));
        }
      }

      deliveryAreas = areasData.map((row: any) => ({
        id: row.id,
        name: row.name,
        synonyms: Array.isArray(row.synonyms) ? row.synonyms : JSON.parse(row.synonyms || "[]"),
        active: row.active,
        display_order: row.display_order,
        map_x: row.map_x,
        map_y: row.map_y,
      }));
    }
  } catch {
    // DB or network failure fallback
    const defaultAreas = [
      { id: "d1", name: "Gulshan", synonyms: ["gulshan", "gulshan 1", "gulshan 2", "gulsan"], active: true, display_order: 1, map_x: 250, map_y: 210 },
      { id: "d2", name: "Banani", synonyms: ["banani", "banani dohs", "banani-11"], active: true, display_order: 2, map_x: 210, map_y: 200 },
      { id: "d3", name: "Baridhara", synonyms: ["baridhara", "baridhara dohs", "baridara"], active: true, display_order: 3, map_x: 290, map_y: 190 },
      { id: "d4", name: "Uttara", synonyms: ["uttara", "uttara sector", "uttara model town"], active: true, display_order: 4, map_x: 200, map_y: 70 },
      { id: "d5", name: "Mirpur", synonyms: ["mirpur", "mirpur 1", "mirpur 2", "mirpur 10", "mirpur 11", "mirpur 12", "mirpur dohs", "pallabi"], active: true, display_order: 5, map_x: 110, map_y: 180 },
      { id: "d6", name: "Mohammadpur", synonyms: ["mohammadpur", "mohammad pur", "town hall", "adabor"], active: true, display_order: 6, map_x: 100, map_y: 290 },
      { id: "d7", name: "Dhanmondi", synonyms: ["dhanmondi", "dhanmondi r/a", "dhanmondi 32"], active: true, display_order: 7, map_x: 160, map_y: 310 },
      { id: "d8", name: "Bashundhara", synonyms: ["bashundhara", "basundhara", "bashundhara r/a"], active: true, display_order: 8, map_x: 270, map_y: 150 },
      { id: "d9", name: "Tejgaon", synonyms: ["tejgaon", "tejgaon i/a", "kawran bazar", "karwan bazar"], active: true, display_order: 9, map_x: 200, map_y: 280 },
      { id: "d10", name: "Motijheel", synonyms: ["motijheel", "matijheel", "dilkusha"], active: true, display_order: 10, map_x: 250, map_y: 390 },
      { id: "d11", name: "Khilgaon", synonyms: ["khilgaon", "khilgon", "taltola"], active: true, display_order: 11, map_x: 290, map_y: 320 },
      { id: "d12", name: "Badda", synonyms: ["badda", "merul badda", "middle badda", "north badda"], active: true, display_order: 12, map_x: 300, map_y: 240 },
      { id: "d13", name: "Rampura", synonyms: ["rampura", "banasree", "aftabnagar", "aftab nagar"], active: true, display_order: 13, map_x: 290, map_y: 270 },
      { id: "d14", name: "Lalbagh", synonyms: ["lalbagh", "old dhaka", "wari", "sadarghat", "chawkbazar"], active: true, display_order: 14, map_x: 210, map_y: 440 },
      { id: "d15", name: "Mogbazar", synonyms: ["mogbazar", "moghbazar", "shantinagar", "shanti nagar", "malibagh", "kakrail"], active: true, display_order: 15, map_x: 240, map_y: 335 },
      { id: "d16", name: "Farmgate", synonyms: ["farmgate", "farm gate", "indira road", "tejturi bazar"], active: true, display_order: 16, map_x: 180, map_y: 310 },
    ];
    deliveryAreas = defaultAreas;
  }

  const categories = (categoriesRes.data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    sort_order: row.sort_order,
    is_active: row.is_active,
    show_on_homepage: row.show_on_homepage,
    show_in_menu: row.show_in_menu,
    is_archived: row.is_archived,
  }));

  return {
    products,
    slides,
    settings: settingsRes.data ? settingsFromRow(settingsRes.data) : null,
    orders: (ordersRes.data || []).map(orderFromRow),
    deliveryAreas,
    categories,
  } satisfies any;
}

export async function saveCategoryRecord({
  data,
}: {
  data: { adminToken?: string | null; category: any };
}) {
  await requireAdmin(data.adminToken);
  const { error } = await db()
    .from("cms_categories")
    .upsert({
      id: data.category.id || undefined,
      name: data.category.name,
      slug: data.category.slug,
      description: data.category.description || null,
      sort_order: data.category.sort_order,
      is_active: data.category.is_active,
      show_on_homepage: data.category.show_on_homepage,
      show_in_menu: data.category.show_in_menu,
      is_archived: data.category.is_archived,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

export async function removeCategoryRecord({
  data,
}: {
  data: { adminToken?: string | null; id: string };
}) {
  await requireAdmin(data.adminToken);
  const { error } = await db()
    .from("cms_categories")
    .delete()
    .eq("id", data.id);
  if (error) throw error;
}

export async function saveProductRecord({
  data,
}: {
  data: { adminToken?: string | null; product: Product };
}) {
  await requireAdmin(data.adminToken);
  const image = await persistMedia(data.product.image, "products");
  const video = await persistMedia(data.product.video, "products");
  const { error } = await db()
    .from("cms_products")
    .upsert(
      {
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
      },
      { onConflict: "slug" },
    );
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function removeProductRecord({
  data,
}: {
  data: { adminToken?: string | null; slug: string };
}) {
  await requireAdmin(data.adminToken);
  const { error } = await db().from("cms_products").delete().eq("slug", data.slug);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function saveSlideRecord({
  data,
}: {
  data: { adminToken?: string | null; slide: HeroSlide; sortOrder?: number };
}) {
  await requireAdmin(data.adminToken);
  const image = await persistMedia(data.slide.image, "hero");
  const video = await persistMedia(data.slide.video, "hero");
  const { error } = await db()
    .from("cms_hero_slides")
    .upsert(
      {
        id: data.slide.id,
        image: image || "",
        video: video || null,
        eyebrow: data.slide.eyebrow,
        title: data.slide.title,
        sub: data.slide.sub,
        sort_order: data.sortOrder ?? 0,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function removeSlideRecord({
  data,
}: {
  data: { adminToken?: string | null; id: string };
}) {
  await requireAdmin(data.adminToken);
  const { error } = await db().from("cms_hero_slides").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function saveSlideOrder({
  data,
}: {
  data: { adminToken?: string | null; ids: string[] };
}) {
  await requireAdmin(data.adminToken);
  await Promise.all(
    data.ids.map((id, sort_order) =>
      db().from("cms_hero_slides").update({ sort_order }).eq("id", id),
    ),
  );
  return { ok: true };
}

export async function saveSettingsRecord({
  data,
}: {
  data: { adminToken?: string | null; settings: SiteSettings };
}) {
  await requireAdmin(data.adminToken);
  try {
    const { error } = await db().from("cms_site_settings").upsert(
      {
        key: "main",
        announcements: data.settings.announcements,
        contact: data.settings.contact,
        footer_tagline: data.settings.footerTagline,
        socials: data.settings.socials,
        delivery_coverage: data.settings.deliveryCoverage,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) throw error;
  } catch (err: any) {
    // Fallback if the database has not been migrated to include delivery_coverage column yet
    if (err.message?.includes("delivery_coverage") || err.message?.includes("column")) {
      const { error } = await db().from("cms_site_settings").upsert(
        {
          key: "main",
          announcements: data.settings.announcements,
          contact: data.settings.contact,
          footer_tagline: data.settings.footerTagline,
          socials: data.settings.socials,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
      if (error) throw new Error(error.message);
    } else {
      throw new Error(err.message || String(err));
    }
  }
  return { ok: true };
}

export async function saveOrderRecord({ data }: { data: { order: Order } }) {
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
}

export async function updateOrderStatusRecord({
  data,
}: {
  data: { adminToken?: string | null; id: string; status: Order["status"] };
}) {
  await requireAdmin(data.adminToken);
  const { error } = await db()
    .from("ecommerce_orders")
    .update({ status: data.status })
    .eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function removeOrderRecord({
  data,
}: {
  data: { adminToken?: string | null; id: string };
}) {
  await requireAdmin(data.adminToken);
  const { error } = await db().from("ecommerce_orders").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function saveDeliveryAreaRecord({
  data,
}: {
  data: { adminToken?: string | null; area: DeliveryArea };
}) {
  await requireAdmin(data.adminToken);
  const { error } = await db()
    .from("delivery_areas")
    .upsert({
      id: data.area.id,
      name: data.area.name,
      synonyms: data.area.synonyms,
      active: data.area.active,
      display_order: data.area.display_order,
      map_x: data.area.map_x,
      map_y: data.area.map_y,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function removeDeliveryAreaRecord({
  data,
}: {
  data: { adminToken?: string | null; id: string };
}) {
  await requireAdmin(data.adminToken);
  const { error } = await db().from("delivery_areas").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
