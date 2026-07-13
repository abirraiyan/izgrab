import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, MapPin } from "lucide-react";
import { cmsStore, useCms, type SiteSettings, type DeliveryArea } from "@/lib/cms-store";
import { supabase } from "@/integrations/supabase/client";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-cocoa focus:ring-1 focus:ring-cocoa";

const labelCls = "block text-xs font-semibold text-cocoa/80 block mb-1";

export default function SettingsAdmin() {
  const { settings, deliveryAreas } = useCms();
  const [activeTab, setActiveTab] = useState<"general" | "delivery" | "admins">("general");

  const [draft, setDraft] = useState<SiteSettings>(() => {
    const s = { ...settings };
    if (!s.deliveryCoverage) {
      s.deliveryCoverage = {
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
    }
    return s;
  });

  // Area editor draft state
  const [areaEdit, setAreaEdit] = useState<{
    id?: string;
    name: string;
    synonyms: string;
    active: boolean;
    display_order: number;
    map_x: number;
    map_y: number;
  } | null>(null);

  const update = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const updateContact = <K extends keyof SiteSettings["contact"]>(
    k: K,
    v: SiteSettings["contact"][K],
  ) => setDraft((d) => ({ ...d, contact: { ...d.contact, [k]: v } }));

  const updateSocial = <K extends keyof SiteSettings["socials"]>(
    k: K,
    v: SiteSettings["socials"][K],
  ) => setDraft((d) => ({ ...d, socials: { ...d.socials, [k]: v } }));

  const updateDelivery = <K extends keyof SiteSettings["deliveryCoverage"]>(
    k: K,
    v: SiteSettings["deliveryCoverage"][K],
  ) => setDraft((d) => ({
    ...d,
    deliveryCoverage: { ...d.deliveryCoverage, [k]: v }
  }));

  const updateDeveloperCredit = <K extends keyof NonNullable<SiteSettings["developerCredit"]>>(
    k: K,
    v: NonNullable<SiteSettings["developerCredit"]>[K],
  ) => setDraft((d) => ({
    ...d,
    developerCredit: {
      text: "Built by Xceptionist",
      url: "https://xceptionist.com/",
      enabled: true,
      ...(d.developerCredit || {}),
      [k]: v
    }
  }));

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    cmsStore.updateSettings(draft);
    toast.success("Site settings saved successfully");
  };

  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaEdit) return;
    if (!areaEdit.name.trim()) {
      toast.error("Area name is required");
      return;
    }

    const parsedSynonyms = areaEdit.synonyms
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const areaData: DeliveryArea = {
      id: areaEdit.id || crypto.randomUUID(),
      name: areaEdit.name.trim(),
      synonyms: parsedSynonyms,
      active: areaEdit.active,
      display_order: Number(areaEdit.display_order) || 0,
      map_x: Number(areaEdit.map_x) || 0,
      map_y: Number(areaEdit.map_y) || 0,
    };

    cmsStore.upsertDeliveryArea(areaData);
    toast.success(areaEdit.id ? "Delivery area updated" : "Delivery area added");
    setAreaEdit(null);
  };

  const handleDeleteArea = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete delivery area "${name}"?`)) {
      cmsStore.removeDeliveryArea(id);
      toast.success("Delivery area removed");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-cocoa">Settings Panel</h2>
          <p className="text-sm text-muted-foreground">
            Configure site-wide parameters, announcements, and delivery coverage settings.
          </p>
        </div>
        <div className="flex bg-cream/40 p-1 rounded-xl border border-cocoa/5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all ${
              activeTab === "general"
                ? "bg-cocoa text-cream shadow-soft"
                : "text-cocoa/60 hover:text-cocoa"
            }`}
          >
            General settings
          </button>
          <button
            onClick={() => setActiveTab("delivery")}
            className={`px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all ${
              activeTab === "delivery"
                ? "bg-cocoa text-cream shadow-soft"
                : "text-cocoa/60 hover:text-cocoa"
            }`}
          >
            Delivery & Areas
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all ${
              activeTab === "admins"
                ? "bg-cocoa text-cream shadow-soft"
                : "text-cocoa/60 hover:text-cocoa"
            }`}
          >
            Administrators
          </button>
        </div>
      </div>

      {activeTab === "general" && (
        <form onSubmit={saveSettings} className="space-y-6">
          {/* Announcements */}
          <Card title="Announcement bar">
            <p className="text-xs text-muted-foreground mb-3">
              These messages rotate across the top of every page.
            </p>
            <div className="space-y-2">
              {draft.announcements.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={m}
                    onChange={(e) => {
                      const next = [...draft.announcements];
                      next[i] = e.target.value;
                      update("announcements", next);
                    }}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        "announcements",
                        draft.announcements.filter((_, idx) => idx !== i),
                      )
                    }
                    className="p-2.5 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update("announcements", [...draft.announcements, ""])}
                className="text-xs text-cocoa inline-flex items-center gap-1.5 hover:underline font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add message
              </button>
            </div>
          </Card>

          {/* Footer tagline */}
          <Card title="Footer tagline">
            <textarea
              rows={3}
              value={draft.footerTagline}
              onChange={(e) => update("footerTagline", e.target.value)}
              className={inputCls + " resize-none"}
            />
          </Card>

          {/* Developer Credit */}
          <Card title="Developer credit">
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={draft.developerCredit?.enabled ?? true}
                  onChange={(e) => updateDeveloperCredit("enabled", e.target.checked)}
                  className="rounded border-border text-cocoa focus:ring-cocoa"
                />
                <span className="text-xs font-semibold text-cocoa/80">Enable developer credit in footer</span>
              </label>

              {(draft.developerCredit?.enabled ?? true) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Display text">
                    <input
                      type="text"
                      value={draft.developerCredit?.text ?? "Built by Xceptionist"}
                      onChange={(e) => updateDeveloperCredit("text", e.target.value)}
                      className={inputCls}
                      placeholder="Built by Xceptionist"
                    />
                  </Field>
                  <Field label="Link URL">
                    <input
                      type="url"
                      value={draft.developerCredit?.url ?? "https://xceptionist.com/"}
                      onChange={(e) => updateDeveloperCredit("url", e.target.value)}
                      className={inputCls}
                      placeholder="https://xceptionist.com/"
                    />
                  </Field>
                </div>
              )}
            </div>
          </Card>

          {/* Contact */}
          <Card title="Contact information">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Address (use line breaks)">
                <textarea
                  rows={3}
                  value={draft.contact.address}
                  onChange={(e) => updateContact("address", e.target.value)}
                  className={inputCls + " resize-none"}
                />
              </Field>
              <Field label="Hours">
                <input
                  value={draft.contact.hours}
                  onChange={(e) => updateContact("hours", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Phone">
                <input
                  value={draft.contact.phone}
                  onChange={(e) => updateContact("phone", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Primary email">
                <input
                  type="email"
                  value={draft.contact.email}
                  onChange={(e) => updateContact("email", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Secondary email">
                <input
                  type="email"
                  value={draft.contact.secondaryEmail}
                  onChange={(e) => updateContact("secondaryEmail", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </Card>

          {/* Socials */}
          <Card title="Social links">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Instagram URL">
                <input
                  value={draft.socials.instagram}
                  onChange={(e) => updateSocial("instagram", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Facebook URL">
                <input
                  value={draft.socials.facebook}
                  onChange={(e) => updateSocial("facebook", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Email link (mailto:…)">
                <input
                  value={draft.socials.email}
                  onChange={(e) => updateSocial("email", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </Card>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Reset ALL site content to defaults? This will erase products, slides, and orders.",
                  )
                ) {
                  cmsStore.resetAll();
                  setDraft(cmsStore.getSnapshot().settings);
                  toast.success("Reset to defaults");
                }
              }}
              className="text-xs text-destructive hover:underline"
            >
              Reset all content to defaults
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-cocoa text-cream text-xs sm:text-sm hover:opacity-95 font-semibold transition"
            >
              Save general settings
            </button>
          </div>
        </form>
      )}

      {activeTab === "delivery" && (
        <div className="space-y-6">
          <form onSubmit={saveSettings} className="space-y-6">
            {/* Card Details */}
            <Card title="Delivery coverage card settings">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Card Title">
                  <input
                    value={draft.deliveryCoverage.title}
                    onChange={(e) => updateDelivery("title", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Status Badge Text">
                  <input
                    value={draft.deliveryCoverage.statusBadgeText}
                    onChange={(e) => updateDelivery("statusBadgeText", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Delivery Hours Description">
                  <input
                    value={draft.deliveryCoverage.deliveryHours}
                    onChange={(e) => updateDelivery("deliveryHours", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Checker Button Text">
                  <input
                    value={draft.deliveryCoverage.buttonText}
                    onChange={(e) => updateDelivery("buttonText", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Checker Placeholder Text">
                  <input
                    value={draft.deliveryCoverage.placeholder}
                    onChange={(e) => updateDelivery("placeholder", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Card Description">
                    <textarea
                      rows={2}
                      value={draft.deliveryCoverage.description}
                      onChange={(e) => updateDelivery("description", e.target.value)}
                      className={inputCls + " resize-none"}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Success Message (use {{Area}} for neighborhood name)">
                    <input
                      value={draft.deliveryCoverage.successMessage}
                      onChange={(e) => updateDelivery("successMessage", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Failure Message">
                    <textarea
                      rows={2}
                      value={draft.deliveryCoverage.failureMessage}
                      onChange={(e) => updateDelivery("failureMessage", e.target.value)}
                      className={inputCls + " resize-none"}
                    />
                  </Field>
                </div>
              </div>
            </Card>

            {/* Feature rows */}
            <Card title="Feature rows (3 items max)">
              <div className="space-y-4">
                {draft.deliveryCoverage.features.map((feat, index) => (
                  <div key={index} className="p-4 bg-cream/20 rounded-xl border border-cocoa/5 space-y-3">
                    <h4 className="text-xs font-bold text-cocoa/80 uppercase tracking-wide">Feature card {index + 1}</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Title">
                        <input
                          value={feat.title}
                          onChange={(e) => updateDeliveryFeature(index, "title", e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Description">
                        <input
                          value={feat.description}
                          onChange={(e) => updateDeliveryFeature(index, "description", e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-cocoa text-cream text-xs sm:text-sm hover:opacity-95 font-semibold transition"
              >
                Save delivery settings
              </button>
            </div>
          </form>

          {/* Delivery Areas list builder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-cocoa">Supported Delivery Areas</h3>
                  <p className="text-xs text-muted-foreground">Manage active zones and their positions on the SVG map.</p>
                </div>
                {!areaEdit && (
                  <button
                    onClick={() => setAreaEdit({
                      name: "",
                      synonyms: "",
                      active: true,
                      display_order: deliveryAreas.length + 1,
                      map_x: 180,
                      map_y: 220
                    })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cocoa text-cream text-xs hover:opacity-90 font-medium transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add area
                  </button>
                )}
              </div>

              {/* Table of delivery areas */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-cream/10 text-xs font-semibold text-cocoa/75">
                        <th className="px-4 py-3">Order</th>
                        <th className="px-4 py-3">Area Name</th>
                        <th className="px-4 py-3">Synonyms</th>
                        <th className="px-4 py-3">Map coordinates</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {deliveryAreas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                            No delivery areas found. Please click "Add area" or reload from cloud.
                          </td>
                        </tr>
                      ) : (
                        deliveryAreas.map((area) => (
                          <tr key={area.id} className="hover:bg-cream/10">
                            <td className="px-4 py-3 font-medium">{area.display_order}</td>
                            <td className="px-4 py-3 font-semibold text-cocoa">{area.name}</td>
                            <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]" title={area.synonyms.join(", ")}>
                              {area.synonyms.join(", ")}
                            </td>
                            <td className="px-4 py-3 font-mono">X:{area.map_x}, Y:{area.map_y}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                area.active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {area.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => setAreaEdit({
                                    id: area.id,
                                    name: area.name,
                                    synonyms: area.synonyms.join(", "),
                                    active: area.active,
                                    display_order: area.display_order,
                                    map_x: area.map_x,
                                    map_y: area.map_y
                                  })}
                                  className="p-1.5 text-cocoa/75 hover:bg-cream rounded-md"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteArea(area.id, area.name)}
                                  className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add / Edit Area Panel */}
            <div className="lg:col-span-1">
              {areaEdit ? (
                <form onSubmit={handleSaveArea} className="bg-card border border-cocoa/10 rounded-2xl p-5 space-y-4 animate-fade-up shadow-soft">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <h3 className="font-serif text-md text-cocoa font-bold">
                      {areaEdit.id ? "Edit Delivery Area" : "Add Delivery Area"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setAreaEdit(null)}
                      className="p-1 rounded-full text-cocoa/40 hover:bg-cream hover:text-cocoa"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <Field label="Area Name">
                    <input
                      required
                      value={areaEdit.name}
                      onChange={(e) => setAreaEdit({ ...areaEdit, name: e.target.value })}
                      placeholder="e.g. Gulshan"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Search Synonyms (comma-separated)">
                    <input
                      value={areaEdit.synonyms}
                      onChange={(e) => setAreaEdit({ ...areaEdit, synonyms: e.target.value })}
                      placeholder="gulshan, gulshan 1, gulshan 2"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Map X coordinate (0-360)">
                      <input
                        type="number"
                        min="0"
                        max="360"
                        value={areaEdit.map_x}
                        onChange={(e) => setAreaEdit({ ...areaEdit, map_x: Number(e.target.value) })}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Map Y coordinate (0-400)">
                      <input
                        type="number"
                        min="0"
                        max="400"
                        value={areaEdit.map_y}
                        onChange={(e) => setAreaEdit({ ...areaEdit, map_y: Number(e.target.value) })}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Display Order">
                      <input
                        type="number"
                        value={areaEdit.display_order}
                        onChange={(e) => setAreaEdit({ ...areaEdit, display_order: Number(e.target.value) })}
                        className={inputCls}
                      />
                    </Field>
                    <label className="flex items-center gap-2 mt-5">
                      <input
                        type="checkbox"
                        checked={areaEdit.active}
                        onChange={(e) => setAreaEdit({ ...areaEdit, active: e.target.checked })}
                        className="rounded border-border text-cocoa focus:ring-cocoa h-4 w-4"
                      />
                      <span className="text-xs font-semibold text-cocoa/80">Active Zone</span>
                    </label>
                  </div>

                  {/* Map Coordinate Helper Hint */}
                  <div className="p-3 bg-cream/35 border border-cocoa/5 rounded-xl flex gap-2 text-[10px] text-cocoa/75 leading-relaxed">
                    <MapPin className="w-4 h-4 shrink-0 text-rose-gold mt-0.5" />
                    <div>
                      <p className="font-bold text-cocoa">SVG Map Helper</p>
                      <p>Uttara is ~ (200, 70)</p>
                      <p>Gulshan/Banani is ~ (220, 205)</p>
                      <p>Dhanmondi is ~ (160, 310)</p>
                      <p>Motijheel is ~ (250, 390)</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAreaEdit(null)}
                      className="flex-1 px-4 py-2 border border-border rounded-full text-xs font-semibold text-cocoa hover:bg-cream transition text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-cocoa text-cream rounded-full text-xs font-semibold hover:opacity-95 transition"
                    >
                      Save Area
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-cream/20 border border-dashed border-cocoa/10 rounded-2xl p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center min-h-[220px]">
                  <MapPin className="w-8 h-8 text-cocoa/20 mb-2" />
                  <p className="font-bold text-cocoa/60">No Area Selected</p>
                  <p className="max-w-[200px] mt-1 mb-3">Select an area to edit, or add a new delivery zone.</p>
                  <button
                    onClick={() => setAreaEdit({
                      name: "",
                      synonyms: "",
                      active: true,
                      display_order: deliveryAreas.length + 1,
                      map_x: 180,
                      map_y: 220
                    })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cocoa text-cream text-[10px] hover:opacity-90 font-semibold transition"
                  >
                    <Plus className="w-3 h-3" /> Add Delivery Area
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminUsersManager() {
  const [admins, setAdmins] = useState<{ id: string; email: string; role: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .in("role", ["admin", "super_admin"])
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setAdmins(data || []);
    } catch (err: any) {
      toast.error(`Failed to load administrators: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setCreating(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) throw new Error("No active session found");

      let functionUrl = import.meta.env.VITE_SUPABASE_URL || "";
      if (functionUrl) {
        functionUrl = functionUrl.replace(/\/rest\/v1\/?$/, "");
      }
      functionUrl = `${functionUrl}/functions/v1/manage-users`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({
          action: "createUser",
          payload: { email: email.trim(), password, is_admin: true }
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create administrator user");
      }

      toast.success(`Administrator user ${email} created successfully!`);
      setEmail("");
      setPassword("");
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete administrator "${email}"? This will completely remove their user account.`)) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) throw new Error("No active session found");

      let functionUrl = import.meta.env.VITE_SUPABASE_URL || "";
      if (functionUrl) {
        functionUrl = functionUrl.replace(/\/rest\/v1\/?$/, "");
      }
      functionUrl = `${functionUrl}/functions/v1/manage-users`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({
          action: "deleteUser",
          payload: { id }
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      toast.success(`Administrator ${email} removed successfully.`);
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-serif text-lg text-cocoa">Create Admin User</h3>
          <p className="text-xs text-muted-foreground">
            This will create a new account in Supabase Authentication and automatically grant it administrative role.
          </p>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-cocoa/80 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="newadmin@example.com"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-cocoa focus:ring-1 focus:ring-cocoa"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cocoa/80 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-cocoa focus:ring-1 focus:ring-cocoa"
              />
            </div>
            <button
              type="submit"
              disabled={creating || !email || !password}
              className="w-full bg-cocoa text-cream py-2.5 rounded-full text-xs font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {creating ? "Creating Account..." : "Create Admin Account"}
            </button>
          </form>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-serif text-lg text-cocoa">Active Administrators</h3>
          {loading ? (
            <p className="text-xs text-muted-foreground animate-pulse">Loading administrator list...</p>
          ) : admins.length === 0 ? (
            <p className="text-xs text-muted-foreground">No administrators found.</p>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-cocoa">{admin.email}</p>
                      <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold uppercase tracking-wider ${
                        admin.role === "super_admin" 
                          ? "bg-destructive/10 text-destructive border border-destructive/20" 
                          : "bg-cocoa/10 text-cocoa border border-cocoa/20"
                      }`}>
                        {admin.role.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Created: {new Date(admin.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition cursor-pointer"
                    aria-label={`Delete ${admin.email}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-serif text-lg text-cocoa mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}
