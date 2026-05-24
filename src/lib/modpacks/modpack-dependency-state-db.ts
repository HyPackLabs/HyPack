import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parsePackDependencyState,
  type PackDependencyState,
} from "@/lib/modpacks/mod-dependency-selection";

export function isMissingDependencyStateColumn(
  error: { message?: string } | null | undefined,
): boolean {
  const message = error?.message?.toLowerCase() ?? "";

  return (
    message.includes("dependency_state") &&
    (message.includes("does not exist") ||
      message.includes("could not find") ||
      message.includes("schema cache"))
  );
}

export const DEPENDENCY_STATE_COLUMN_ERROR =
  "Required mod tags cannot be saved until the database is migrated. Run supabase/migrations/20260522_add_dependency_state.sql in Supabase.";

export async function fetchModpackDependencyState(
  supabase: SupabaseClient,
  modpackId: string,
): Promise<PackDependencyState | null> {
  const { data, error } = await supabase
    .from("modpacks")
    .select("dependency_state")
    .eq("id", modpackId)
    .maybeSingle();

  if (error) {
    if (!isMissingDependencyStateColumn(error)) {
      console.error("Failed to fetch dependency state:", error.message);
    }
    return null;
  }

  return parsePackDependencyState(data?.dependency_state);
}

export type DependencyStateSaveResult =
  | { ok: true }
  | { ok: false; error: "column_missing" | "save_failed" };

export async function updateModpackDependencyState(
  supabase: SupabaseClient,
  modpackId: string,
  userId: string,
  dependencyState: PackDependencyState | null,
): Promise<DependencyStateSaveResult> {
  const { error } = await supabase
    .from("modpacks")
    .update({ dependency_state: dependencyState })
    .eq("id", modpackId)
    .eq("clerk_user_id", userId);

  if (!error) {
    return { ok: true };
  }

  if (isMissingDependencyStateColumn(error)) {
    return { ok: false, error: "column_missing" };
  }

  console.error("Failed to update dependency state:", error.message);
  return { ok: false, error: "save_failed" };
}
