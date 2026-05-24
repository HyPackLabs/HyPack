import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import {
  isMissingDependencyStateColumn,
  DEPENDENCY_STATE_COLUMN_ERROR,
} from "@/lib/modpacks/modpack-dependency-state-db";
import {
  sanitizePackDependencyState,
  type PackDependencyState,
} from "@/lib/modpacks/mod-dependency-selection";

export type CreateModpackInput = {
  title: string;
  modIds: number[];
  dependencyState?: PackDependencyState | null;
};

export type CreateModpackResult =
  | { ok: true; modpackId: string }
  | { ok: false; error: string };

export async function createModpack(
  userId: string,
  input: CreateModpackInput,
): Promise<CreateModpackResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured." };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Modpack title is required." };
  }

  const supabase = createServerSupabaseClient();
  const dependencyState = sanitizePackDependencyState(
    input.modIds,
    input.dependencyState,
  );

  const baseInsert = {
    clerk_user_id: userId,
    title,
  };

  let modpack:
    | {
        id: string;
      }
    | null = null;
  let modpackError: { message?: string } | null = null;

  const insertWithDependency = await supabase
    .from("modpacks")
    .insert({
      ...baseInsert,
      dependency_state: dependencyState,
    })
    .select("id")
    .single();

  modpack = insertWithDependency.data;
  modpackError = insertWithDependency.error;

  if (modpackError && isMissingDependencyStateColumn(modpackError)) {
    return { ok: false, error: DEPENDENCY_STATE_COLUMN_ERROR };
  }

  if (modpackError || !modpack) {
    console.error("Failed to create modpack:", modpackError?.message);
    return { ok: false, error: "Could not create modpack. Try again." };
  }

  if (input.modIds.length > 0) {
    const { error: modsError } = await supabase.from("modpack_mods").insert(
      input.modIds.map((curseforgeModId, index) => ({
        modpack_id: modpack.id,
        curseforge_mod_id: curseforgeModId,
        sort_order: index,
      })),
    );

    if (modsError) {
      console.error("Failed to add mods:", modsError.message);
      await supabase.from("modpacks").delete().eq("id", modpack.id);
      return { ok: false, error: "Could not save mods to the modpack." };
    }
  }

  return { ok: true, modpackId: modpack.id };
}
