import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  uploadImage,
  uploadVideo,
  getCloudinaryUrl,
  type CloudinaryMetadata,
} from "@/lib/cloudinary";
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Copy,
  Search,
  Check,
  X,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface MediaLibraryProps {
  isPicker?: boolean;
  onSelect?: (media: CloudinaryMetadata) => void;
  onClose?: () => void;
  allowedType?: "image" | "video" | "all";
}

const folders = [
  { label: "All folders", value: "all" },
  { label: "Products", value: "iz-grab/products" },
  { label: "Hero slides", value: "iz-grab/hero" },
  { label: "Categories", value: "iz-grab/categories" },
  { label: "About page", value: "iz-grab/about" },
];

export default function MediaLibrary({
  isPicker = false,
  onSelect,
  onClose,
  allowedType = "all",
}: MediaLibraryProps) {
  const [media, setMedia] = useState<CloudinaryMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "image" | "video">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setLoading(true);
    let items: CloudinaryMetadata[] = [];
    try {
      const { data, error } = await supabase
        .from("cms_media")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      if (data) {
        items = data as CloudinaryMetadata[];
      }
    } catch (err) {
      console.warn("Supabase fetch failed (or quota restricted). Using local media storage fallback.");
      items = JSON.parse(localStorage.getItem("iz-cloudinary-media") || "[]");
    }
    setMedia(items);
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const saveToLocalStorage = (newItem: CloudinaryMetadata) => {
    const localItems = JSON.parse(localStorage.getItem("iz-cloudinary-media") || "[]");
    const updated = [newItem, ...localItems.filter((x: any) => x.public_id !== newItem.public_id)];
    localStorage.setItem("iz-cloudinary-media", JSON.stringify(updated));
  };

  const removeFromLocalStorage = (publicId: string) => {
    const localItems = JSON.parse(localStorage.getItem("iz-cloudinary-media") || "[]");
    const updated = localItems.filter((x: any) => x.public_id !== publicId);
    localStorage.setItem("iz-cloudinary-media", JSON.stringify(updated));
  };

  const handleUpload = async (file: File) => {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      return toast.error("Unsupported file type. Please upload images or videos.");
    }
    if (allowedType === "image" && !isImage) {
      return toast.error("Only image uploads are permitted in this field.");
    }
    if (allowedType === "video" && !isVideo) {
      return toast.error("Only video uploads are permitted in this field.");
    }

    // Assign appropriate folder
    let folder = "iz-grab/gallery";
    if (selectedFolder !== "all") {
      folder = selectedFolder;
    } else if (isImage) {
      folder = "iz-grab/products";
    } else if (isVideo) {
      folder = "iz-grab/videos";
    }

    setUploading(true);
    setUploadProgress("Uploading to Cloudinary...");
    
    try {
      let metadata: CloudinaryMetadata;
      if (isVideo) {
        metadata = await uploadVideo(file, folder);
      } else {
        metadata = await uploadImage(file, folder);
      }

      setUploadProgress("Saving metadata to database...");
      
      // Save metadata to Supabase
      try {
        const { error } = await supabase.from("cms_media").insert({
          public_id: metadata.public_id,
          secure_url: metadata.secure_url,
          resource_type: metadata.resource_type,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          folder: metadata.folder,
        });
        if (error) throw error;
      } catch (dbErr) {
        console.warn("Could not save metadata to Supabase (restricted quota). Metadata saved to local cache.");
      }

      // Also save to local storage fallback
      saveToLocalStorage(metadata);

      toast.success("Media uploaded successfully");
      loadMedia();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleDelete = async (item: CloudinaryMetadata) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;

    try {
      // Delete from database
      try {
        await supabase.from("cms_media").delete().eq("public_id", item.public_id);
      } catch (dbErr) {
        console.warn("Supabase delete failed. Deleting locally.");
      }

      // Delete from local storage fallback
      if (item.public_id) {
        removeFromLocalStorage(item.public_id);
      }

      toast.success("Media deleted from library");
      loadMedia();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete media");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logic
  const filtered = media.filter((item) => {
    const matchesSearch = item.public_id.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === "all" || item.folder === selectedFolder;
    
    let matchesType = true;
    if (selectedType !== "all") {
      matchesType = item.resource_type === selectedType;
    } else if (allowedType !== "all") {
      matchesType = item.resource_type === allowedType;
    }

    return matchesSearch && matchesFolder && matchesType;
  });

  const renderContent = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background text-xs outline-none focus:border-cocoa"
            />
          </div>

          {/* Folder Filter */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 border border-border rounded-xl bg-background text-xs outline-none focus:border-cocoa"
          >
            {folders.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Resource Type Filter */}
          {allowedType === "all" && (
            <div className="flex bg-muted p-0.5 rounded-lg border border-border">
              {(["all", "image", "video"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 text-[10px] uppercase font-semibold tracking-wider rounded-md transition ${
                    selectedType === t
                      ? "bg-background text-cocoa shadow-sm"
                      : "text-muted-foreground hover:text-cocoa"
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Upload Trigger Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={allowedType === "image" ? "image/*" : allowedType === "video" ? "video/*" : "image/*,video/*"}
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full md:w-auto bg-cocoa text-cocoa-foreground px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{uploadProgress || "Uploading..."}</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload file</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="w-8 h-8 text-cocoa animate-spin mb-2" />
          <p className="text-xs text-muted-foreground">Loading media library items...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl py-20 text-center text-muted-foreground flex flex-col items-center justify-center bg-card/25">
          <FolderOpen className="w-10 h-10 text-muted-foreground/30 mb-2" />
          <p className="text-sm font-semibold text-cocoa/70">No media assets found</p>
          <p className="text-xs max-w-xs mt-1">
            Search query did not match any assets, or the selected folder is currently empty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => {
            const isVideo = item.resource_type === "video";
            const fileUrl = getCloudinaryUrl(item.secure_url, { width: 400 });
            return (
              <div
                key={item.public_id}
                className="group bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300 flex flex-col"
              >
                {/* Media Preview Area */}
                <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center select-none border-b border-border/40">
                  {isVideo ? (
                    <video
                      src={item.secure_url}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img
                      src={fileUrl}
                      alt={item.public_id}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Resource indicator badge */}
                  <div className="absolute top-2 left-2 bg-background/95 backdrop-blur text-cocoa text-[9px] font-bold p-1 rounded-md shadow-sm flex items-center gap-1 uppercase select-none">
                    {isVideo ? (
                      <VideoIcon className="w-2.5 h-2.5 text-rose-gold" />
                    ) : (
                      <ImageIcon className="w-2.5 h-2.5 text-rose-gold" />
                    )}
                    <span>{item.format}</span>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-cocoa/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    {isPicker ? (
                      <button
                        onClick={() => onSelect && onSelect(item)}
                        className="bg-cream text-cocoa px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-gold transition shadow"
                      >
                        Select file
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCopy(item.secure_url, item.public_id)}
                          className="w-8 h-8 rounded-lg bg-background text-cocoa hover:text-rose-gold flex items-center justify-center transition shadow"
                          title="Copy Link"
                        >
                          {copiedId === item.public_id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="w-8 h-8 rounded-lg bg-background text-destructive hover:bg-destructive hover:text-cream flex items-center justify-center transition shadow"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3 text-[10px] flex-1 flex flex-col justify-between gap-1.5 min-w-0">
                  <div className="min-w-0">
                    <p
                      className="font-semibold text-cocoa truncate"
                      title={item.public_id.split("/").pop()}
                    >
                      {item.public_id.split("/").pop()}
                    </p>
                    <p className="text-muted-foreground truncate">{item.folder || "Uncategorized"}</p>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground border-t border-border/30 pt-1.5">
                    <span>{item.width} × {item.height}</span>
                    {item.bytes && (
                      <span>{(item.bytes / 1024).toFixed(0)} KB</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isPicker) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-5xl bg-background rounded-3xl border border-border shadow-elegant flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-cocoa font-bold">Select Media</h3>
              <p className="text-xs text-muted-foreground">Choose an existing media file or upload a new one.</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-cocoa/40 hover:bg-cream hover:text-cocoa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid Panel scroll wrapper */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-cocoa">Media Library</h2>
        <p className="text-sm text-muted-foreground">
          Upload and organize digital assets directly on Cloudinary.
        </p>
      </div>

      {renderContent()}
    </div>
  );
}
