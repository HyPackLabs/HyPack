import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import {
  DEPENDENCY_STATE_COLUMN_ERROR,
  updateModpackDependencyState,
} from "@/lib/modpacks/modpack-dependency-state-db";
import {
  sanitizePackDependencyState,
  type PackDependencyState,
} from "@/lib/modpacks/mod-dependency-selection";

export type UpdateModpackContentInput = {
  title?: string;
  modIds: number[];
  dependencyState?: PackDependencyState | null;
};

export type UpdateModpackContentResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateModpackContent(
  userId: string,
  modpackId: string,
  input: UpdateModpackContentInput,
): Promise<UpdateModpackContentResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured." };
  }

  const title =
    input.title !== undefined ? input.title.trim() : undefined;
  if (title !== undefined && !title) {
    return { ok: false, error: "Modpack title is required." };
  }

  const modIds = input.modIds.filter(
    (id): id is number => Number.isInteger(id) && id > 0,
  );
  const dependencyState = sanitizePackDependencyState(
    modIds,
    input.dependencyState,
  );

  const supabase = createServerSupabaseClient();

  const { data: modpack, error: modpackError } = await supabase
    .from("modpacks")
    .select("id")
    .eq("id", modpackId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (modpackError || !modpack) {
    if (modpackError) {
      console.error("Failed to fetch modpack for update:", modpackError.message);
    }
    return { ok: false, error: "Modpack not found." };
  }

  const modpackUpdates: { title?: string } = {};

  if (title !== undefined) {
    modpackUpdates.title = title;
  }

  if (Object.keys(modpackUpdates).length > 0) {
    const { error: updateError } = await supabase
      .from("modpacks")
      .update(modpackUpdates)
      .eq("id", modpackId)
      .eq("clerk_user_id", userId);

    if (updateError) {
      console.error("Failed to update modpack:", updateError.message);
      return { ok: false, error: "Could not save modpack. Try again." };
    }
  }

  if (input.dependencyState !== undefined) {
    const dependencyResult = await updateModpackDependencyState(
      supabase,
      modpackId,
      userId,
      dependencyState,
    );

    if (!dependencyResult.ok) {
      return {
        ok: false,
        error:
          dependencyResult.error === "column_missing"
            ? DEPENDENCY_STATE_COLUMN_ERROR
            : "Could not save modpack. Try again.",
      };
    }
  }

  const { error: deleteError } = await supabase
    .from("modpack_mods")
    .delete()
    .eq("modpack_id", modpackId);

  if (deleteError) {
    console.error("Failed to clear modpack mods:", deleteError.message);
    return { ok: false, error: "Could not update mod list. Try again." };
  }

  if (modIds.length > 0) {
    const { error: insertError } = await supabase.from("modpack_mods").insert(
      modIds.map((curseforgeModId, index) => ({
        modpack_id: modpackId,
        curseforge_mod_id: curseforgeModId,
        sort_order: index,
      })),
    );

    if (insertError) {
      console.error("Failed to save modpack mods:", insertError.message);
      return { ok: false, error: "Could not save mods to the modpack." };
    }
  }

  return { ok: true };
}
