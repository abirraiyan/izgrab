import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { cmsStore, fileToDataUrl, useCms } from "@/lib/cms-store";
import type { Product } from "@/lib/products";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

const emptyProduct: Product = {
  slug: "",
  name: "",
  price: 0,
  image: "",
  video: "",
  category: "Coffee",
  description: "",
  ingredients: "",
  sizes: [],
  flavors: [],
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

const categoryOptions = ["Coffee", "Croissants", "Cakes", "Desserts", "Meals", "Gift Boxes"];
const tagOptions = ["", "Best Seller", "Limited", "New"] as const;

function ProductsAdmin() {
  const { products } = useCms();
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl text-cocoa">Products</h2>
          <p className="text-sm text-muted-foreground">
            Add, edit, or remove items shown across the shop.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyProduct, slug: `new-${Date.now().toString(36)}` })}
          className="bg-cocoa text-cocoa-foreground px-4 py-2.5 rounded-full text-sm inline-flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> New product
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs tracking-wide uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Tag</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.slug} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-cocoa">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">
                    {p.tag ? (
                      <span className="bg-blush text-cocoa text-[10px] font-medium px-2 py-1 rounded-full">
                        {p.tag}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-cocoa">
                    ৳{p.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditing(p)}
                      className="p-2 text-cocoa hover:bg-muted rounded-lg"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"?`)) {
                          cmsStore.removeProduct(p.slug);
                          toast.success("Product deleted");
                        }
                      }}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ProductDrawer
          product={editing}
          onClose={() => setEditing(null)}
          onSave={async (p) => {
            try {
              await cmsStore.upsertProduct(p);
              toast.success("Product saved to database");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Product could not be saved");
              return;
            }
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ProductDrawer({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [draft, setDraft] = useState<Product>(product);
  const update = <K extends keyof Product>(k: K, v: Product[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const onUploadImage = async (file: File) => {
    if (file.size > MAX_IMAGE_BYTES) {
      return toast.error(
        `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_IMAGE_BYTES / 1024 / 1024}MB.`,
      );
    }
    const url = await fileToDataUrl(file);
    update("image", url);
    toast.success("Image attached");
  };

  const onUploadVideo = async (file: File) => {
    if (file.size > MAX_VIDEO_BYTES) {
      return toast.error(
        `Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_VIDEO_BYTES / 1024 / 1024}MB — host on a CDN and paste the URL.`,
      );
    }
    const url = await fileToDataUrl(file);
    update("video", url);
    toast.success("Video attached — plays on hover");
  };

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return toast.error("Name is required");
    if (!draft.image) return toast.error("Image is required");
    onSave({
      ...draft,
      slug: draft.slug.startsWith("new-") || !draft.slug ? slugify(draft.name) : draft.slug,
      sizes: draft.sizes.filter(Boolean),
      flavors: draft.flavors.filter(Boolean),
      tag: draft.tag || undefined,
      video: draft.video || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-cocoa/40" onClick={onClose} />
      <form
        onSubmit={submit}
        className="w-full max-w-xl bg-background h-full overflow-y-auto"
      >
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-serif text-xl text-cocoa">
            {product.slug.startsWith("new-") ? "New product" : "Edit product"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <Field label="Image">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                {draft.image && (
                  <img src={draft.image} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && onUploadImage(e.target.files[0])}
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-cocoa file:text-cocoa-foreground file:px-3 file:py-2 file:text-xs file:cursor-pointer"
                />
                <input
                  type="url"
                  placeholder="…or paste image URL"
                  value={draft.image.startsWith("data:") ? "" : draft.image}
                  onChange={(e) => update("image", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </Field>

          <Field label="Video (optional — plays on hover in product cards)">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                {draft.video ? (
                  <video src={draft.video} muted loop playsInline autoPlay className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground text-center px-1">No video</span>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/*"
                  onChange={(e) => e.target.files?.[0] && onUploadVideo(e.target.files[0])}
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-cocoa file:text-cocoa-foreground file:px-3 file:py-2 file:text-xs file:cursor-pointer"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="…or paste video URL (.mp4 / .webm)"
                    value={draft.video?.startsWith("data:") ? "" : draft.video ?? ""}
                    onChange={(e) => update("video", e.target.value)}
                    className={inputCls}
                  />
                  {draft.video && (
                    <button
                      type="button"
                      onClick={() => update("video", "")}
                      className="px-3 rounded-lg border border-border text-xs hover:border-destructive hover:text-destructive whitespace-nowrap"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <input
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Price (৳)">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={draft.price === 0 ? "" : String(draft.price)}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, "");
                  update("price", v === "" ? 0 : Number(v));
                }}
                placeholder="0"
                className={inputCls}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputCls}
              >
                {categoryOptions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Tag">
              <select
                value={draft.tag ?? ""}
                onChange={(e) =>
                  update("tag", (e.target.value || undefined) as Product["tag"])
                }
                className={inputCls}
              >
                {tagOptions.map((t) => (
                  <option key={t} value={t}>
                    {t || "— None —"}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              className={inputCls + " resize-none"}
            />
          </Field>

          <Field label="Ingredients">
            <textarea
              rows={2}
              value={draft.ingredients}
              onChange={(e) => update("ingredients", e.target.value)}
              className={inputCls + " resize-none"}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sizes (comma-separated)">
              <input
                value={draft.sizes.join(", ")}
                onChange={(e) =>
                  update(
                    "sizes",
                    e.target.value.split(",").map((s) => s.trim()),
                  )
                }
                className={inputCls}
                placeholder='6 inch, 8 inch'
              />
            </Field>
            <Field label="Flavors (comma-separated)">
              <input
                value={draft.flavors.join(", ")}
                onChange={(e) =>
                  update(
                    "flavors",
                    e.target.value.split(",").map((s) => s.trim()),
                  )
                }
                className={inputCls}
                placeholder="Vanilla, Chocolate"
              />
            </Field>
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm border border-border hover:border-cocoa"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-full text-sm bg-cocoa text-cocoa-foreground hover:opacity-90"
          >
            Save product
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-cocoa";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-cocoa block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
