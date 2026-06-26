import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { cmsStore, useCms, type SiteSettings } from "@/lib/cms-store";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-cocoa";

function SettingsAdmin() {
  const { settings } = useCms();
  const [draft, setDraft] = useState<SiteSettings>(settings);

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

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    cmsStore.updateSettings(draft);
    toast.success("Site settings saved");
  };

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-2xl text-cocoa">Site settings</h2>
        <p className="text-sm text-muted-foreground">
          Edit announcement bar, footer, and contact information.
        </p>
      </div>

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
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update("announcements", [...draft.announcements, ""])}
            className="text-xs text-cocoa inline-flex items-center gap-1.5 hover:underline"
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

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset ALL site content to defaults? This will erase products, slides, and orders.")) {
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
          className="px-6 py-3 rounded-full bg-cocoa text-cocoa-foreground text-sm hover:opacity-90"
        >
          Save settings
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-serif text-lg text-cocoa mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-cocoa block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
