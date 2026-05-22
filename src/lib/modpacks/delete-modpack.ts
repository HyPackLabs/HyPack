import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export async function deleteModpack(
  userId: string,
  modpackId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("modpacks")
    .delete()
    .eq("id", modpackId)
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Failed to delete modpack:", error.message);
    return false;
  }

  return true;
}
