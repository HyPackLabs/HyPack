import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export type CreateModpackInput = {
  title: string;
  modIds: number[];
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

  const { data: modpack, error: modpackError } = await supabase
    .from("modpacks")
    .insert({
      clerk_user_id: userId,
      title,
    })
    .select("id")
    .single();

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
