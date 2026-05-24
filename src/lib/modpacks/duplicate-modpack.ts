import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { CreateModpackResult } from "@/lib/modpacks/create-modpack";
import {
  fetchModpackDependencyState,
  isMissingDependencyStateColumn,
} from "@/lib/modpacks/modpack-dependency-state-db";
import type { ModpackVisibility } from "@/lib/modpacks/types";
import { copyModpackIcon } from "@/lib/modpacks/upload-modpack-icon";

type SourceModpackRow = {
  id: string;
  title: string;
  description: string;
  visibility: ModpackVisibility;
  clerk_user_id: string;
  icon_url: string | null;
  modpack_mods: { curseforge_mod_id: number; sort_order: number }[] | null;
};

export async function duplicateModpack(
  userId: string,
  modpackId: string,
): Promise<CreateModpackResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured." };
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
      clerk_user_id,
      icon_url,
      modpack_mods ( curseforge_mod_id, sort_order )
    `,
    )
    .eq("id", modpackId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to fetch modpack for duplicate:", error.message);
    }
    return { ok: false, error: "Modpack not found." };
  }

  const source = data as SourceModpackRow;
  const isOwner = source.clerk_user_id === userId;

  if (source.visibility === "Private" && !isOwner) {
    return { ok: false, error: "Modpack not found." };
  }

  const mods = [...(source.modpack_mods ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const dependencyState = await fetchModpackDependencyState(supabase, source.id);

  const baseInsert = {
    clerk_user_id: userId,
    title: `${source.title} (Copy)`,
    description: source.description,
    visibility: isOwner ? source.visibility : "Private",
  };

  let modpack: { id: string } | null = null;
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
    const insertWithoutDependency = await supabase
      .from("modpacks")
      .insert(baseInsert)
      .select("id")
      .single();

    modpack = insertWithoutDependency.data;
    modpackError = insertWithoutDependency.error;
  }

  if (modpackError || !modpack) {
    console.error("Failed to duplicate modpack:", modpackError?.message);
    return { ok: false, error: "Could not duplicate modpack. Try again." };
  }

  if (mods.length > 0) {
    const { error: modsError } = await supabase.from("modpack_mods").insert(
      mods.map((mod, index) => ({
        modpack_id: modpack.id,
        curseforge_mod_id: mod.curseforge_mod_id,
        sort_order: index,
      })),
    );

    if (modsError) {
      console.error("Failed to copy mods:", modsError.message);
      await supabase.from("modpacks").delete().eq("id", modpack.id);
      return { ok: false, error: "Could not copy mods to the duplicate." };
    }
  }

  if (source.icon_url) {
    const copiedIconUrl = await copyModpackIcon(
      userId,
      source.id,
      modpack.id,
      source.icon_url,
    );

    if (copiedIconUrl) {
      await supabase
        .from("modpacks")
        .update({ icon_url: copiedIconUrl })
        .eq("id", modpack.id);
    }
  }

  return { ok: true, modpackId: modpack.id };
}
