export const MODPACK_ICON_BUCKET = "modpack-icons";
export const MODPACK_ICON_MAX_BYTES = 2 * 1024 * 1024;

export const MODPACK_ICON_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
]);

export function getModpackIconExtension(contentType: string): string | null {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return null;
  }
}

export function getModpackIconStoragePath(
  userId: string,
  modpackId: string,
  extension: string,
): string {
  return `${userId}/${modpackId}.${extension}`;
}

export function getModpackIconPublicUrl(
  supabaseUrl: string,
  storagePath: string,
): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${MODPACK_ICON_BUCKET}/${storagePath}`;
}

export function extractModpackIconStoragePath(iconUrl: string): string | null {
  const marker = `/storage/v1/object/public/${MODPACK_ICON_BUCKET}/`;
  const index = iconUrl.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return iconUrl.slice(index + marker.length);
}
