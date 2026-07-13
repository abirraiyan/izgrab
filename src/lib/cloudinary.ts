export interface CloudinaryMetadata {
  id?: string;
  public_id: string;
  secure_url: string;
  resource_type: "image" | "video";
  width: number;
  height: number;
  format: string;
  bytes?: number;
  folder?: string;
  created_at?: string;
}

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  crop?: string;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.warn(
    "Cloudinary configuration missing. Ensure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are set in .env."
  );
}

export async function uploadToCloudinary(
  fileOrBase64: File | string,
  folder: string,
  resourceType: "image" | "video" = "image"
): Promise<CloudinaryMetadata> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration missing. Please check VITE_CLOUDINARY_CLOUD_NAME.");
  }

  const formData = new FormData();
  formData.append("file", fileOrBase64);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = await response.json();
  return {
    public_id: data.public_id,
    secure_url: data.secure_url,
    resource_type: data.resource_type || resourceType,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
    folder: folder,
    created_at: data.created_at || new Date().toISOString(),
  };
}

export async function uploadImage(
  fileOrBase64: File | string,
  folder: string
): Promise<CloudinaryMetadata> {
  return uploadToCloudinary(fileOrBase64, folder, "image");
}

export async function uploadVideo(
  fileOrBase64: File | string,
  folder: string
): Promise<CloudinaryMetadata> {
  return uploadToCloudinary(fileOrBase64, folder, "video");
}

export async function deleteMedia(id: string): Promise<boolean> {
  // Direct client deletion of Cloudinary files is restricted as it requires signature keys.
  // We delete the reference record from the Supabase public.cms_media table.
  const { supabase } = await import("@/integrations/supabase/client");
  const { error } = await supabase.from("cms_media").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete media from database: ${error.message}`);
  }
  return true;
}

export function buildTransformation(options?: CloudinaryTransformOptions): string {
  const parts: string[] = [];
  const format = options?.format || "auto";
  const quality = options?.quality || "auto";

  parts.push(`f_${format}`);
  parts.push(`q_${quality}`);

  if (options?.width) {
    parts.push(`w_${options.width}`);
  }
  if (options?.height) {
    parts.push(`h_${options.height}`);
  }
  if (options?.crop) {
    parts.push(`c_${options.crop}`);
  } else if (options?.width && options?.height) {
    parts.push("c_fill");
  }

  return parts.join(",");
}

export function getCloudinaryUrl(
  value: string | undefined | null | object | any,
  options?: CloudinaryTransformOptions
): string {
  if (!value) return "/placeholder.jpg";

  let secureUrl = "";

  if (typeof value === "object" && value !== null) {
    secureUrl = value.secure_url || "";
  } else if (typeof value === "string") {
    if (value.startsWith("{")) {
      try {
        const parsed = JSON.parse(value);
        secureUrl = parsed.secure_url || "";
      } catch {
        secureUrl = value;
      }
    } else {
      secureUrl = value;
    }
  }

  if (!secureUrl) return "/placeholder.jpg";

  // Check if it is a Cloudinary URL to insert format & quality transformations
  if (secureUrl.includes("res.cloudinary.com")) {
    const transformStr = buildTransformation(options);
    if (secureUrl.includes("/upload/")) {
      return secureUrl.replace("/upload/", `/upload/${transformStr}/`);
    }
  }

  return secureUrl;
}

export function generateImageUrl(
  value: string | undefined | null | object | any,
  options?: CloudinaryTransformOptions
): string {
  return getCloudinaryUrl(value, options);
}

export function generateVideoUrl(
  value: string | undefined | null | object | any,
  options?: CloudinaryTransformOptions
): string {
  return getCloudinaryUrl(value, { ...options, format: options?.format || "auto" });
}

export function responsiveImage(
  value: string,
  widths: number[] = [320, 640, 768, 1024, 1280]
): { src: string; srcSet: string } {
  const src = getCloudinaryUrl(value);
  const srcSet = widths
    .map((w) => {
      const url = getCloudinaryUrl(value, { width: w });
      return `${url} ${w}w`;
    })
    .join(", ");
  return { src, srcSet };
}

export function optimizedThumbnail(value: string): string {
  return getCloudinaryUrl(value, { width: 150, height: 150, crop: "thumb" });
}
