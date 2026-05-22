import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { Modpack, ModpackVisibility } from "@/lib/modpacks/types";

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Updated today";
  if (diffDays === 1) return "Updated yesterday";
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Updated ${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }

  return `Updated ${date.toLocaleDateString()}`;
}

type ModpackRow = {
  id: string;
  title: string;
  description: string;
  visibility: ModpackVisibility;
  updated_at: string;
  icon_url: string | null;
  modpack_mods: { id: string }[] | null;
};

export async function getUserModpacks(userId: string): Promise<Modpack[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("modpacks")
    .select(
      `
      id,
      title,
      description,
      visibility,
      updated_at,
      icon_url,
      modpack_mods ( id )
    `,
    )
    .eq("clerk_user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch modpacks:", error.message);
    return [];
  }

  return ((data ?? []) as ModpackRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    visibility: row.visibility,
    modCount: row.modpack_mods?.length ?? 0,
    updatedAt: formatUpdatedAt(row.updated_at),
    iconUrl: row.icon_url,
    likes: 0,
  }));
}
