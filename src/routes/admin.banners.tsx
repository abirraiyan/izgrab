import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { cmsStore, fileToDataUrl, useCms, type HeroSlide } from "@/lib/cms-store";

export const Route = createFileRoute("/admin/banners")({
  component: BannersAdmin,
});

const emptySlide: HeroSlide = {
  id: "",
  image: "",
  video: "",
  eyebrow: "",
  title: "",
  sub: "",
};

// Upload limits — data URLs balloon ~1.37x; cap to keep IDB persistence snappy.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB
const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25MB

function BannersAdmin() {
  const { slides } = useCms();
  const [editing, setEditing] = useState<HeroSlide | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl text-cocoa">Hero slides</h2>
          <p className="text-sm text-muted-foreground">
            These appear in the homepage hero slider, in order.
          </p>
        </div>
        <button
          onClick={() =>
            setEditing({ ...emptySlide, id: `slide_${Date.now().toString(36)}` })
          }
          className="bg-cocoa text-cocoa-foreground px-4 py-2.5 rounded-full text-sm inline-flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> New slide
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="aspect-[16/9] bg-muted relative">
              {s.video ? (
                <video
                  src={s.video}
                  poster={s.image || undefined}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : s.image ? (
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-r from-cocoa/70 to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-cream">
                <p className="text-[10px] tracking-[0.3em] uppercase opacity-80">
                  {s.eyebrow}
                </p>
                <p className="font-serif text-xl mt-1 whitespace-pre-line line-clamp-2">
                  {s.title}
                </p>
              </div>
              <span className="absolute top-3 left-3 bg-background/90 text-cocoa text-xs font-medium px-2.5 py-1 rounded-full">
                Slide {idx + 1}
              </span>
              {s.video && (
                <span className="absolute top-3 right-3 bg-cocoa text-cocoa-foreground text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded-full">
                  Video
                </span>
              )}
            </div>
            <div className="p-4 flex justify-between gap-2">
              <div className="flex gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => cmsStore.moveSlide(s.id, -1)}
                  className="p-2 rounded-lg border border-border disabled:opacity-30 hover:border-cocoa"
                  aria-label="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  disabled={idx === slides.length - 1}
                  onClick={() => cmsStore.moveSlide(s.id, 1)}
                  className="p-2 rounded-lg border border-border disabled:opacity-30 hover:border-cocoa"
                  aria-label="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(s)}
                  className="p-2 rounded-lg border border-border hover:border-cocoa text-cocoa"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this slide?")) {
                      cmsStore.removeSlide(s.id);
                      toast.success("Slide removed");
                    }
                  }}
                  className="p-2 rounded-lg border border-border hover:bg-destructive/10 text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="lg:col-span-2 bg-card border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground">
            No slides yet. Add one to populate the homepage hero.
          </div>
        )}
      </div>

      {editing && (
        <SlideDrawer
          slide={editing}
          onClose={() => setEditing(null)}
          onSave={async (s) => {
            try {
              await cmsStore.upsertSlide(s);
              toast.success("Slide saved to database");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Slide could not be saved");
              return;
            }
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function SlideDrawer({
  slide,
  onClose,
  onSave,
}: {
  slide: HeroSlide;
  onClose: () => void;
  onSave: (s: HeroSlide) => void;
}) {
  const [draft, setDraft] = useState<HeroSlide>(slide);
  const update = <K extends keyof HeroSlide>(k: K, v: HeroSlide[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const onUploadImage = async (file: File) => {
    if (file.size > MAX_IMAGE_BYTES) {
      return toast.error(
        `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_IMAGE_BYTES / 1024 / 1024}MB — try compressing or paste a hosted URL.`,
      );
    }
    const url = await fileToDataUrl(file);
    update("image", url);
    toast.success("Image attached");
  };

  const onUploadVideo = async (file: File) => {
    if (file.size > MAX_VIDEO_BYTES) {
      return toast.error(
        `Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_VIDEO_BYTES / 1024 / 1024}MB — host on YouTube/Cloudinary/CDN and paste the URL instead.`,
      );
    }
    const url = await fileToDataUrl(file);
    update("video", url);
    toast.success("Video attached — autoplays muted on the homepage");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return toast.error("Title is required");
    if (!draft.image && !draft.video) return toast.error("Add an image or video");
    onSave({ ...draft, video: draft.video || undefined });
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-cocoa";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-cocoa/40" onClick={onClose} />
      <form
        onSubmit={submit}
        className="w-full max-w-xl bg-background h-full overflow-y-auto"
      >
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-serif text-xl text-cocoa">Edit slide</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <label className="block">
            <span className="text-xs font-medium text-cocoa block mb-1.5">
              Background image <span className="text-muted-foreground font-normal">(used as poster if a video is set)</span>
            </span>
            <div className="flex items-center gap-4">
              <div className="w-28 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
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
          </label>

          <label className="block">
            <span className="text-xs font-medium text-cocoa block mb-1.5">
              Background video <span className="text-muted-foreground font-normal">(optional — overrides the image, autoplays muted)</span>
            </span>
            <div className="flex items-center gap-4">
              <div className="w-28 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                {draft.video ? (
                  <video src={draft.video} muted loop playsInline autoPlay className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">No video</span>
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
                    placeholder="…or paste hosted video URL (.mp4 / .webm)"
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
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tip: short, silent loops (5–15s, ≤25MB) work best. For longer or HD clips, host on a CDN and paste the URL.
                </p>
              </div>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-cocoa block mb-1.5">Eyebrow (small text above title)</span>
            <input
              value={draft.eyebrow}
              onChange={(e) => update("eyebrow", e.target.value)}
              className={inputCls}
              placeholder="Signature Collection"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-cocoa block mb-1.5">Title (use line break for two lines)</span>
            <textarea
              rows={3}
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputCls + " resize-none font-serif"}
              placeholder={"Where Pâtisserie\nMeets Poetry."}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-cocoa block mb-1.5">Subtitle</span>
            <textarea
              rows={3}
              value={draft.sub}
              onChange={(e) => update("sub", e.target.value)}
              className={inputCls + " resize-none"}
            />
          </label>
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
            Save slide
          </button>
        </div>
      </form>
    </div>
  );
}
