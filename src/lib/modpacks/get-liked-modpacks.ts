import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { Modpack, ModpackVisibility } from "@/lib/modpacks/types";

function formatLikedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Liked today";
  if (diffDays === 1) return "Liked yesterday";
  if (diffDays < 7) return `Liked ${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Liked ${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }

  return `Liked ${date.toLocaleDateString()}`;
}

type LikedModpackRow = {
  created_at: string;
  modpacks: {
    id: string;
    title: string;
    description: string;
    visibility: ModpackVisibility;
    updated_at: string;
    icon_url: string | null;
    modpack_mods: { id: string }[] | null;
  } | null;
};

export type LikedModpack = Modpack & {
  likedAt: string;
};

export async function getLikedModpacks(userId: string): Promise<LikedModpack[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("modpack_likes")
    .select(
      `
      created_at,
      modpacks (
        id,
        title,
        description,
        visibility,
        updated_at,
        icon_url,
        modpack_mods ( id )
      )
    `,
    )
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch liked modpacks:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as LikedModpackRow[])
    .map((row) => {
      const modpack = Array.isArray(row.modpacks) ? row.modpacks[0] : row.modpacks;
      return { created_at: row.created_at, modpacks: modpack ?? null };
    })
    .filter(
      (
        row,
      ): row is LikedModpackRow & {
        modpacks: NonNullable<LikedModpackRow["modpacks"]>;
      } => row.modpacks !== null,
    )
    .map((row) => ({
      id: row.modpacks.id,
      title: row.modpacks.title,
      description: row.modpacks.description,
      visibility: row.modpacks.visibility,
      modCount: row.modpacks.modpack_mods?.length ?? 0,
      updatedAt: formatLikedAt(row.created_at),
      likedAt: row.created_at,
      iconUrl: row.modpacks.icon_url,
      likes: 0,
    }));
}
