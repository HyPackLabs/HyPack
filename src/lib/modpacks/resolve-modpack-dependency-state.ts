import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildPackDependencyState } from "@/lib/modpacks/build-pack-dependency-state";
import {
  EMPTY_PACK_DEPENDENCY_STATE,
  sanitizePackDependencyState,
  type PackDependencyState,
} from "@/lib/modpacks/mod-dependency-selection";
import { updateModpackDependencyState } from "@/lib/modpacks/modpack-dependency-state-db";

export function loadStoredModpackDependencyState(
  modIds: number[],
  stored: PackDependencyState | null,
): PackDependencyState {
  return (
    sanitizePackDependencyState(modIds, stored) ?? EMPTY_PACK_DEPENDENCY_STATE
  );
}

/** One-time rebuild for legacy modpacks, then persist to Supabase. */
export async function backfillModpackDependencyState(
  userId: string,
  modpackId: string,
  modIds: number[],
): Promise<PackDependencyState> {
  if (modIds.length === 0) {
    return EMPTY_PACK_DEPENDENCY_STATE;
  }

  const rebuilt = await buildPackDependencyState(modIds);
  const sanitized =
    sanitizePackDependencyState(modIds, rebuilt) ?? EMPTY_PACK_DEPENDENCY_STATE;

  const supabase = createServerSupabaseClient();
  await updateModpackDependencyState(
    supabase,
    modpackId,
    userId,
    sanitized,
  );

  return sanitized;
}
