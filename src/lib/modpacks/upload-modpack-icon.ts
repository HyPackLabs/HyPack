import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import {
  MODPACK_ICON_ALLOWED_TYPES,
  MODPACK_ICON_BUCKET,
  MODPACK_ICON_MAX_BYTES,
  extractModpackIconStoragePath,
  getModpackIconExtension,
  getModpackIconPublicUrl,
  getModpackIconStoragePath,
} from "@/lib/modpacks/icon";

export type UploadModpackIconResult =
  | { ok: true; iconUrl: string }
  | { ok: false; error: string };

async function verifyModpackOwner(
  userId: string,
  modpackId: string,
): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("modpacks")
    .select("id, icon_url")
    .eq("id", modpackId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  return Boolean(data);
}

async function getExistingIconUrl(
  userId: string,
  modpackId: string,
): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("modpacks")
    .select("icon_url")
    .eq("id", modpackId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  return (data?.icon_url as string | null | undefined) ?? null;
}

async function removeIconFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) {
    return;
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.storage.from(MODPACK_ICON_BUCKET).remove(paths);
  if (error) {
    console.error("Failed to remove modpack icon file:", error.message);
  }
}

export async function uploadModpackIcon(
  userId: string,
  modpackId: string,
  file: File,
): Promise<UploadModpackIconResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured." };
  }

  if (!(await verifyModpackOwner(userId, modpackId))) {
    return { ok: false, error: "Modpack not found." };
  }

  if (!MODPACK_ICON_ALLOWED_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Icon must be a JPEG or PNG image.",
    };
  }

  if (file.size > MODPACK_ICON_MAX_BYTES) {
    return { ok: false, error: "Icon must be 2 MB or smaller." };
  }

  const extension = getModpackIconExtension(file.type);
  if (!extension) {
    return { ok: false, error: "Unsupported image type." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return { ok: false, error: "Database is not configured." };
  }

  const supabase = createServerSupabaseClient();
  const storagePath = getModpackIconStoragePath(userId, modpackId, extension);
  const bytes = Buffer.from(await file.arrayBuffer());
  const existingIconUrl = await getExistingIconUrl(userId, modpackId);
  const existingPath = existingIconUrl
    ? extractModpackIconStoragePath(existingIconUrl)
    : null;

  const { error: uploadError } = await supabase.storage
    .from(MODPACK_ICON_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Failed to upload modpack icon:", uploadError.message);
    return { ok: false, error: "Could not upload icon. Try again." };
  }

  const iconUrl = getModpackIconPublicUrl(supabaseUrl, storagePath);

  const { error: updateError } = await supabase
    .from("modpacks")
    .update({ icon_url: iconUrl })
    .eq("id", modpackId)
    .eq("clerk_user_id", userId);

  if (updateError) {
    console.error("Failed to save modpack icon URL:", updateError.message);
    await removeIconFiles([storagePath]);
    return { ok: false, error: "Could not save icon. Try again." };
  }

  if (existingPath && existingPath !== storagePath) {
    await removeIconFiles([existingPath]);
  }

  return { ok: true, iconUrl };
}

export async function removeModpackIcon(
  userId: string,
  modpackId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured." };
  }

  const existingIconUrl = await getExistingIconUrl(userId, modpackId);
  if (!existingIconUrl) {
    return { ok: true };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("modpacks")
    .update({ icon_url: null })
    .eq("id", modpackId)
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Failed to clear modpack icon URL:", error.message);
    return { ok: false, error: "Could not remove icon." };
  }

  const existingPath = extractModpackIconStoragePath(existingIconUrl);
  if (existingPath) {
    await removeIconFiles([existingPath]);
  }

  return { ok: true };
}

export async function copyModpackIcon(
  userId: string,
  sourceModpackId: string,
  targetModpackId: string,
  sourceIconUrl: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const sourcePath = extractModpackIconStoragePath(sourceIconUrl);
  if (!sourcePath) {
    return null;
  }

  const extension = sourcePath.split(".").pop();
  if (!extension) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const targetPath = getModpackIconStoragePath(
    userId,
    targetModpackId,
    extension,
  );

  const { error: copyError } = await supabase.storage
    .from(MODPACK_ICON_BUCKET)
    .copy(sourcePath, targetPath);

  if (copyError) {
    console.error("Failed to copy modpack icon:", copyError.message);
    return null;
  }

  return getModpackIconPublicUrl(supabaseUrl, targetPath);
}
