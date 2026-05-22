import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export type ToggleModpackLikeResult =
  | { ok: true; likes: number; likedByUser: boolean }
  | { ok: false; error: string };

async function modpackExists(modpackId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("modpacks")
    .select("id")
    .eq("id", modpackId)
    .maybeSingle();
  return Boolean(data);
}

export async function getModpackLikeState(
  modpackId: string,
  userId: string | null,
): Promise<{ likes: number; likedByUser: boolean }> {
  if (!isSupabaseConfigured()) {
    return { likes: 0, likedByUser: false };
  }

  const supabase = createServerSupabaseClient();

  const [{ count }, existingLikeResult] = await Promise.all([
    supabase
      .from("modpack_likes")
      .select("*", { count: "exact", head: true })
      .eq("modpack_id", modpackId),
    userId
      ? supabase
          .from("modpack_likes")
          .select("id")
          .eq("modpack_id", modpackId)
          .eq("clerk_user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const existingLike = existingLikeResult.data;

  return {
    likes: count ?? 0,
    likedByUser: Boolean(existingLike),
  };
}

export async function getModpackLikeCounts(
  modpackIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const modpackId of modpackIds) {
    counts.set(modpackId, 0);
  }

  if (!isSupabaseConfigured() || modpackIds.length === 0) {
    return counts;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("modpack_likes")
    .select("modpack_id")
    .in("modpack_id", modpackIds);

  if (error) {
    console.error("Failed to fetch modpack like counts:", error.message);
    return counts;
  }

  for (const row of data ?? []) {
    const modpackId = row.modpack_id as string;
    counts.set(modpackId, (counts.get(modpackId) ?? 0) + 1);
  }

  return counts;
}

export async function getModpackLikedByUser(
  modpackIds: string[],
  userId: string,
): Promise<Set<string>> {
  const likedIds = new Set<string>();

  if (!isSupabaseConfigured() || modpackIds.length === 0) {
    return likedIds;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("modpack_likes")
    .select("modpack_id")
    .eq("clerk_user_id", userId)
    .in("modpack_id", modpackIds);

  if (error) {
    console.error("Failed to fetch user modpack likes:", error.message);
    return likedIds;
  }

  for (const row of data ?? []) {
    likedIds.add(row.modpack_id as string);
  }

  return likedIds;
}

export async function toggleModpackLike(
  userId: string,
  modpackId: string,
): Promise<ToggleModpackLikeResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured." };
  }

  if (!(await modpackExists(modpackId))) {
    return { ok: false, error: "Modpack not found." };
  }

  const supabase = createServerSupabaseClient();

  const { data: existingLike } = await supabase
    .from("modpack_likes")
    .select("id")
    .eq("modpack_id", modpackId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (existingLike) {
    const { error } = await supabase
      .from("modpack_likes")
      .delete()
      .eq("id", existingLike.id);

    if (error) {
      console.error("Failed to remove like:", error.message);
      return { ok: false, error: "Could not remove like." };
    }
  } else {
    const { error } = await supabase.from("modpack_likes").insert({
      modpack_id: modpackId,
      clerk_user_id: userId,
    });

    if (error) {
      console.error("Failed to add like:", error.message);
      return { ok: false, error: "Could not add like." };
    }
  }

  const state = await getModpackLikeState(modpackId, userId);
  return { ok: true, ...state };
}
