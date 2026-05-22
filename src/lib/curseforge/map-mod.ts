import type { CurseForgeModSummary } from "@/lib/curseforge/types";

type CurseForgeModPayload = {
  id?: number;
  name?: string;
  slug?: string;
  summary?: string;
  downloadCount?: number;
  logo?: {
    thumbnailUrl?: string;
    url?: string;
  } | null;
};

export function mapCurseForgeMod(mod: CurseForgeModPayload): CurseForgeModSummary | null {
  if (typeof mod.id !== "number" || !mod.name || !mod.slug) {
    return null;
  }

  return {
    id: mod.id,
    name: mod.name,
    slug: mod.slug,
    summary: mod.summary ?? "",
    downloadCount: mod.downloadCount ?? 0,
    logoUrl: mod.logo?.thumbnailUrl ?? mod.logo?.url ?? null,
  };
}
