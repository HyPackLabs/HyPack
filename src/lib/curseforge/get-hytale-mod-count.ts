import {
  CURSEFORGE_API_BASE,
  HYTALE_GAME_ID,
  HYTALE_MOD_COUNT_CACHE_SECONDS,
  HYTALE_MODS_CLASS_ID,
} from "@/lib/curseforge/constants";
import { isCurseForgeConfigured } from "@/lib/curseforge/client";
import { loadCurseForgeApiKey } from "@/lib/curseforge/load-api-key";
import { formatDownloads } from "@/lib/modpacks/format-downloads";

type SearchModsResponse = {
  pagination?: {
    totalCount?: number;
  };
};

function getModCountCacheSeconds(): number {
  const fromEnv = process.env.HYTALE_MOD_COUNT_CACHE_SECONDS;
  if (!fromEnv) {
    return HYTALE_MOD_COUNT_CACHE_SECONDS;
  }

  const parsed = Number(fromEnv);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return HYTALE_MOD_COUNT_CACHE_SECONDS;
}

/**
 * Fetches total Hytale mod count from CurseForge search pagination.
 * Filters to the Mods class only (not prefabs, worlds, bootstrap, translations).
 * Cached via Next.js Data Cache — not called on every homepage load.
 */
export async function getHytaleModCount(): Promise<number | null> {
  if (!isCurseForgeConfigured()) {
    return null;
  }

  const apiKey = loadCurseForgeApiKey();
  if (!apiKey) {
    return null;
  }

  const url = new URL(`${CURSEFORGE_API_BASE}/mods/search`);
  url.searchParams.set("gameId", String(HYTALE_GAME_ID));
  url.searchParams.set("classId", String(HYTALE_MODS_CLASS_ID));
  url.searchParams.set("pageSize", "1");
  url.searchParams.set("index", "0");
  url.searchParams.set("sortField", "2");
  url.searchParams.set("sortOrder", "desc");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-api-key": apiKey,
    },
    next: { revalidate: getModCountCacheSeconds() },
  });

  if (!response.ok) {
    throw new Error(`CurseForge search failed (${response.status})`);
  }

  const payload = (await response.json()) as SearchModsResponse;
  return payload.pagination?.totalCount ?? null;
}

export async function getHytaleModCountDisplay(): Promise<string> {
  try {
    const count = await getHytaleModCount();
    if (count === null) {
      return "—";
    }

    return `${formatDownloads(count)}+`;
  } catch {
    return "—";
  }
}
