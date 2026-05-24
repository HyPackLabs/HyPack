import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { formatCreatedDate } from "@/lib/modpacks/format-created-date";
import { isMissingDependencyStateColumn } from "@/lib/modpacks/modpack-dependency-state-db";
import { parsePackDependencyState } from "@/lib/modpacks/mod-dependency-selection";
import { getModpackLikeState } from "@/lib/modpacks/toggle-modpack-like";
import type { ModpackDetail, ModpackVisibility } from "@/lib/modpacks/types";

type ModpackDetailRow = {
  id: string;
  title: string;
  description: string;
  visibility: ModpackVisibility;
  created_at: string;
  clerk_user_id: string;
  icon_url: string | null;
  dependency_state?: unknown;
  modpack_mods: { curseforge_mod_id: number; sort_order: number }[] | null;
};

const MODPACK_DETAIL_SELECT = `
  id,
  title,
  description,
  visibility,
  created_at,
  clerk_user_id,
  icon_url,
  dependency_state,
  modpack_mods ( curseforge_mod_id, sort_order )
`;

const MODPACK_DETAIL_SELECT_LEGACY = `
  id,
  title,
  description,
  visibility,
  created_at,
  clerk_user_id,
  icon_url,
  modpack_mods ( curseforge_mod_id, sort_order )
`;

export async function getModpackDetailForViewer(
  viewerUserId: string | null,
  modpackId: string,
): Promise<ModpackDetail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  let { data, error } = await supabase
    .from("modpacks")
    .select(MODPACK_DETAIL_SELECT)
    .eq("id", modpackId)
    .maybeSingle();

  if (error && isMissingDependencyStateColumn(error)) {
    ({ data, error } = await supabase
      .from("modpacks")
      .select(MODPACK_DETAIL_SELECT_LEGACY)
      .eq("id", modpackId)
      .maybeSingle());
  }

  if (error || !data) {
    if (error) {
      console.error("Failed to fetch modpack:", error.message);
    }
    return null;
  }

  const row = data as ModpackDetailRow;
  const isOwner =
    viewerUserId !== null && row.clerk_user_id === viewerUserId;

  if (row.visibility === "Private" && !isOwner) {
    return null;
  }

  const mods = [...(row.modpack_mods ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  const likeState = await getModpackLikeState(row.id, viewerUserId);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    visibility: row.visibility,
    createdAt: formatCreatedDate(row.created_at),
    likes: likeState.likes,
    likedByUser: likeState.likedByUser,
    modIds: mods.map((mod) => mod.curseforge_mod_id),
    isOwner,
    iconUrl: row.icon_url,
    dependencyState: parsePackDependencyState(row.dependency_state),
  };
}

/** Owner-only fetch for settings and other management flows. */
export async function getModpackDetail(
  userId: string,
  modpackId: string,
): Promise<ModpackDetail | null> {
  const modpack = await getModpackDetailForViewer(userId, modpackId);
  return modpack?.isOwner ? modpack : null;
}
