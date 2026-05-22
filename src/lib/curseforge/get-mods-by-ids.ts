import { curseforgePost } from "@/lib/curseforge/client";
import { mapCurseForgeMod } from "@/lib/curseforge/map-mod";
import type { CurseForgeModSummary } from "@/lib/curseforge/types";

type RawModsResponse = {
  data?: unknown[];
};

export async function getModsByIds(
  modIds: number[],
): Promise<CurseForgeModSummary[]> {
  if (modIds.length === 0) {
    return [];
  }

  const payload = await curseforgePost<RawModsResponse>("/mods", {
    modIds,
    filterPcOnly: false,
  });

  return (payload.data ?? [])
    .map((mod) => mapCurseForgeMod(mod as Parameters<typeof mapCurseForgeMod>[0]))
    .filter((mod): mod is CurseForgeModSummary => mod !== null);
}
