import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X, Archive } from "lucide-react";
import { cmsStore, useCms, type Category } from "@/lib/cms-store";

const emptyCategory: Category = {
  id: "",
  name: "",
  slug: "",
  description: "",
  sort_order: 0,
  is_active: true,
  show_on_homepage: true,
  show_in_menu: true,
  is_archived: false,
};

export default function CategoriesAdmin() {
  const { categories } = useCms();
  const [editing, setEditing] = useState<Category | null>(null);

  // Active / non-archived categories
  const activeCategories = categories.filter((c) => !c.is_archived);
  const archivedCategories = categories.filter((c) => c.is_archived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl text-cocoa">Menu Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage your store menu categories, sorting order, and visibility configurations.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyCategory, sort_order: categories.length + 1 })}
          className="bg-cocoa text-cream px-4 py-2.5 rounded-full text-sm inline-flex items-center gap-2 hover:opacity-90 transition font-medium"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Active categories list */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-serif text-lg text-cocoa">Active & Configured Categories</h3>
          {activeCategories.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No categories created yet. Click "Add Category" above.</p>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
              {activeCategories.map((c, idx) => (
                <div key={c.id || c.slug} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/5 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-cocoa">{c.name}</h4>
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">
                        /{c.slug}
                      </span>
                      {!c.is_active && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold uppercase">
                          Disabled
                        </span>
                      )}
                    </div>
                    {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                    <div className="flex gap-4 pt-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">
                        Homepage: <strong className={c.show_on_homepage ? "text-emerald-600" : "text-cocoa/40"}>{c.show_on_homepage ? "Yes" : "No"}</strong>
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Menu Filter: <strong className={c.show_in_menu ? "text-emerald-600" : "text-cocoa/40"}>{c.show_in_menu ? "Yes" : "No"}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Reordering */}
                    <div className="flex gap-1 mr-2">
                      <button
                        disabled={idx === 0}
                        onClick={() => cmsStore.moveCategory(c.id, -1)}
                        className="p-2 rounded-lg border border-border disabled:opacity-30 hover:border-cocoa transition"
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === activeCategories.length - 1}
                        onClick={() => cmsStore.moveCategory(c.id, 1)}
                        className="p-2 rounded-lg border border-border disabled:opacity-30 hover:border-cocoa transition"
                        aria-label="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => setEditing(c)}
                      className="p-2 rounded-lg border border-border hover:border-cocoa text-cocoa transition"
                      aria-label="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Archive category "${c.name}"? It will no longer show up on the visitor website.`)) {
                          cmsStore.upsertCategory({ ...c, is_archived: true });
                          toast.success("Category archived");
                        }
                      }}
                      className="p-2 rounded-lg border border-border hover:bg-amber-50 text-amber-600 transition"
                      aria-label="Archive"
                      title="Archive"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to permanently delete category "${c.name}"?`)) {
                          cmsStore.removeCategory(c.id);
                          toast.success("Category deleted");
                        }
                      }}
                      className="p-2 rounded-lg border border-border hover:bg-destructive/10 text-destructive transition"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Archived categories list */}
        {archivedCategories.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-serif text-lg text-cocoa opacity-60 flex items-center gap-2">
              <Archive className="w-4 h-4" /> Archived Categories
            </h3>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background/50">
              {archivedCategories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 hover:bg-muted/5 transition opacity-70">
                  <div>
                    <h4 className="text-sm font-semibold text-cocoa">{c.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono">/{c.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        cmsStore.upsertCategory({ ...c, is_archived: false });
                        toast.success("Category restored from archives");
                      }}
                      className="px-3 py-1 text-xs font-semibold rounded-full border border-border hover:border-cocoa text-cocoa transition"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Permanently delete category "${c.name}"?`)) {
                          cmsStore.removeCategory(c.id);
                          toast.success("Category deleted");
                        }
                      }}
                      className="p-2 rounded-lg border border-border hover:bg-destructive/10 text-destructive transition"
                      aria-label="Delete permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editing && (
        <CategoryDrawer
          category={editing}
          onClose={() => setEditing(null)}
          onSave={async (cat) => {
            try {
              if (!cat.id) {
                cat.id = `cat_${Date.now().toString(36)}`;
              }
              await cmsStore.upsertCategory(cat);
              toast.success("Category saved successfully");
            } catch (err: any) {
              toast.error(err.message || "Failed to save category");
              return;
            }
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CategoryDrawer({
  category,
  onClose,
  onSave,
}: {
  category: Category;
  onClose: () => void;
  onSave: (c: Category) => void;
}) {
  const [draft, setDraft] = useState<Category>(category);
  const update = <K extends keyof Category>(k: K, v: Category[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return toast.error("Category name is required");
    
    let slug = draft.slug.trim().toLowerCase();
    if (!slug) {
      slug = draft.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    
    onSave({ ...draft, slug });
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-cocoa";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-cocoa/40 backdrop-blur-xs" onClick={onClose} />
      <form onSubmit={submit} className="w-full max-w-xl bg-background h-full overflow-y-auto shadow-xl flex flex-col justify-between">
        <div>
          <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
            <h3 className="font-serif text-xl text-cocoa">{draft.id ? "Edit Category" : "Add Category"}</h3>
            <button type="button" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-cocoa block mb-1.5">Category Name</label>
              <input
                type="text"
                required
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Cakes, Specialty Beverages"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cocoa block mb-1.5">Category URL Slug (Optional)</label>
              <input
                type="text"
                value={draft.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="e.g. cakes, specialty-drinks (auto-generated if left empty)"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cocoa block mb-1.5">Description</label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe this category..."
                className={inputCls + " resize-none"}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-cocoa block mb-1.5">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={draft.sort_order}
                  onChange={(e) => update("sort_order", Number(e.target.value) || 1)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => update("is_active", e.target.checked)}
                  className="rounded border-border text-cocoa focus:ring-cocoa"
                />
                <div>
                  <span className="text-xs font-semibold text-cocoa block">Is Active</span>
                  <span className="text-[10px] text-muted-foreground">Toggle visibility for this entire category and its products</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={draft.show_on_homepage}
                  onChange={(e) => update("show_on_homepage", e.target.checked)}
                  className="rounded border-border text-cocoa focus:ring-cocoa"
                />
                <div>
                  <span className="text-xs font-semibold text-cocoa block">Show on Homepage</span>
                  <span className="text-[10px] text-muted-foreground">Make this category visible in the editorial row card listing</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={draft.show_in_menu}
                  onChange={(e) => update("show_in_menu", e.target.checked)}
                  className="rounded border-border text-cocoa focus:ring-cocoa"
                />
                <div>
                  <span className="text-xs font-semibold text-cocoa block">Show in Shop Menu</span>
                  <span className="text-[10px] text-muted-foreground">Add this category name inside the dynamic menu filter bar</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border p-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-border rounded-full text-xs font-semibold text-cocoa hover:bg-cream transition text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-cocoa text-cream rounded-full text-xs font-semibold hover:opacity-95 transition"
          >
            Save Category
          </button>
        </div>
      </form>
    </div>
  );
}
