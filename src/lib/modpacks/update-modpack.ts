import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { ModpackVisibility } from "@/lib/modpacks/types";

export type UpdateModpackInput = {
  title: string;
  description: string;
  visibility: ModpackVisibility;
};

export type UpdateModpackResult =
  | { ok: true }
  | { ok: false; error: string };

const visibilityValues: ModpackVisibility[] = ["Private", "Unlisted", "Public"];

export async function updateModpack(
  userId: string,
  modpackId: string,
  input: UpdateModpackInput,
): Promise<UpdateModpackResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured." };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Modpack title is required." };
  }

  if (!visibilityValues.includes(input.visibility)) {
    return { ok: false, error: "Invalid visibility setting." };
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("modpacks")
    .update({
      title,
      description: input.description.trim(),
      visibility: input.visibility,
    })
    .eq("id", modpackId)
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Failed to update modpack:", error.message);
    return { ok: false, error: "Could not save settings. Try again." };
  }

  return { ok: true };
}
