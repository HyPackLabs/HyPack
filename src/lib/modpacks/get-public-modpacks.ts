import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { getClerkUserProfiles } from "@/lib/clerk/get-user-profiles";
import type { ModpackVisibility, PublicModpack } from "@/lib/modpacks/types";
import { getModpackLikeCounts, getModpackLikedByUser } from "@/lib/modpacks/toggle-modpack-like";

export const EXPLORE_PAGE_SIZE = 25;

export type PublicModpacksResult = {
  modpacks: PublicModpack[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type GetPublicModpacksOptions = {
  query?: string;
  page?: number;
  pageSize?: number;
  creatorId?: string;
  viewerUserId?: string | null;
};

type ModpackRow = {
  id: string;
  title: string;
  description: string;
  visibility: ModpackVisibility;
  updated_at: string;
  icon_url: string | null;
  clerk_user_id: string;
  modpack_mods: { id: string }[] | null;
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

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export async function getPublicModpacks(
  options: GetPublicModpacksOptions = {},
): Promise<PublicModpacksResult> {
  const pageSize = options.pageSize ?? EXPLORE_PAGE_SIZE;
  const page = Math.max(1, options.page ?? 1);
  const query = options.query?.trim() ?? "";
  const creatorId = options.creatorId?.trim() ?? "";

  if (!isSupabaseConfigured()) {
    return {
      modpacks: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const supabase = createServerSupabaseClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabase
    .from("modpacks")
    .select(
      `
      id,
      title,
      description,
      visibility,
      updated_at,
      icon_url,
      clerk_user_id,
      modpack_mods ( id )
    `,
      { count: "exact" },
    )
    .eq("visibility", "Public")
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (creatorId) {
    request = request.eq("clerk_user_id", creatorId);
  }

  if (query) {
    const pattern = `%${escapeIlike(query)}%`;
    request = request.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }

  const { data, error, count } = await request;

  if (error) {
    console.error("Failed to fetch public modpacks:", error.message);
    return {
      modpacks: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const totalCount = count ?? 0;
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
  const rows = (data ?? []) as ModpackRow[];
  const modpackIds = rows.map((row) => row.id);
  const [likeCounts, likedByUserIds] = await Promise.all([
    getModpackLikeCounts(modpackIds),
    options.viewerUserId
      ? getModpackLikedByUser(modpackIds, options.viewerUserId)
      : Promise.resolve(new Set<string>()),
  ]);
  const creatorProfiles = await getClerkUserProfiles(
    rows.map((row) => row.clerk_user_id),
  );

  return {
    modpacks: rows.map((row) => {
      const creator =
        creatorProfiles.get(row.clerk_user_id) ?? {
          id: row.clerk_user_id,
          displayName: "Unknown user",
          avatarUrl: null,
        };

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        visibility: row.visibility,
        modCount: row.modpack_mods?.length ?? 0,
        updatedAt: formatUpdatedAt(row.updated_at),
        iconUrl: row.icon_url,
        likes: likeCounts.get(row.id) ?? 0,
        likedByUser: likedByUserIds.has(row.id),
        creatorId: row.clerk_user_id,
        creator,
      };
    }),
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
