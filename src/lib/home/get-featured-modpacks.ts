import { getHypackUserId } from "@/lib/clerk/get-hypack-user-id";
import { getClerkUserProfiles } from "@/lib/clerk/get-user-profiles";
import type { FeaturedModpack } from "@/lib/home-data";
import { getModpackLikeCounts } from "@/lib/modpacks/toggle-modpack-like";
import type { ModpackVisibility } from "@/lib/modpacks/types";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

type ModpackRow = {
  id: string;
  title: string;
  description: string;
  visibility: ModpackVisibility;
  updated_at: string;
  icon_url: string | null;
  clerk_user_id: string;
};

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

function mapRowToFeaturedModpack(
  row: ModpackRow,
  likes: number,
  author: string,
  isHypackTeam: boolean,
): FeaturedModpack {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.description || "No description yet.",
    author,
    isHypackTeam,
    likes,
    visibility: row.visibility,
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)] ?? null;
}

async function getModpacksForUser(
  userId: string,
  excludeIds: string[] = [],
): Promise<ModpackRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("modpacks")
    .select("id, title, description, visibility, updated_at, icon_url, clerk_user_id")
    .eq("clerk_user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch featured user modpacks:", error.message);
    return [];
  }

  const excluded = new Set(excludeIds);
  return ((data ?? []) as ModpackRow[]).filter((row) => !excluded.has(row.id));
}

async function getPublicModpackRows(
  excludeIds: string[] = [],
): Promise<ModpackRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("modpacks")
    .select("id, title, description, visibility, updated_at, icon_url, clerk_user_id")
    .eq("visibility", "Public")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch featured public modpacks:", error.message);
    return [];
  }

  const excluded = new Set(excludeIds);
  return ((data ?? []) as ModpackRow[]).filter((row) => !excluded.has(row.id));
}

async function enrichFeaturedModpack(
  row: ModpackRow,
  hypackUserId: string,
): Promise<FeaturedModpack> {
  const [likeCounts, creatorProfiles] = await Promise.all([
    getModpackLikeCounts([row.id]),
    getClerkUserProfiles([row.clerk_user_id]),
  ]);

  const creator = creatorProfiles.get(row.clerk_user_id);
  return mapRowToFeaturedModpack(
    row,
    likeCounts.get(row.id) ?? 0,
    creator?.displayName ?? "Unknown user",
    row.clerk_user_id === hypackUserId,
  );
}

async function selectSecondFeaturedModpack(
  excludeIds: string[],
): Promise<ModpackRow | null> {
  const publicModpacks = await getPublicModpackRows(excludeIds);
  if (publicModpacks.length === 0) {
    return null;
  }

  const likeCounts = await getModpackLikeCounts(publicModpacks.map((row) => row.id));
  const withLikes = publicModpacks
    .map((row) => ({
      row,
      likes: likeCounts.get(row.id) ?? 0,
    }))
    .filter((entry) => entry.likes > 0)
    .sort((left, right) => {
      if (right.likes !== left.likes) {
        return right.likes - left.likes;
      }

      return (
        Date.parse(right.row.updated_at) - Date.parse(left.row.updated_at)
      );
    });

  if (withLikes.length > 0) {
    return withLikes[0]!.row;
  }

  return pickRandom(publicModpacks);
}

export async function getFeaturedHomeModpacks(): Promise<FeaturedModpack[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const hypackUserId = await getHypackUserId();
  if (!hypackUserId) {
    return [];
  }

  const hypackModpacks = await getModpacksForUser(hypackUserId);
  const firstRow = hypackModpacks[0] ?? null;
  if (!firstRow) {
    return [];
  }

  const featured: FeaturedModpack[] = [
    await enrichFeaturedModpack(firstRow, hypackUserId),
  ];

  const secondPublicRow = await selectSecondFeaturedModpack([firstRow.id]);
  if (secondPublicRow) {
    featured.push(await enrichFeaturedModpack(secondPublicRow, hypackUserId));
    return featured;
  }

  const secondHypackRow = hypackModpacks.find((row) => row.id !== firstRow.id) ?? null;
  if (secondHypackRow) {
    featured.push(await enrichFeaturedModpack(secondHypackRow, hypackUserId));
  }

  return featured;
}
