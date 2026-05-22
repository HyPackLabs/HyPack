import {
  HYTALE_GAME_ID,
  MOD_SEARCH_PAGE_SIZE,
} from "@/lib/curseforge/constants";
import { curseforgeFetch } from "@/lib/curseforge/client";
import { mapCurseForgeMod } from "@/lib/curseforge/map-mod";
import type { CurseForgeSearchResponse } from "@/lib/curseforge/types";

type RawSearchResponse = {
  data?: unknown[];
  pagination?: {
    index?: number;
    pageSize?: number;
    resultCount?: number;
    totalCount?: number;
  };
};

export async function searchHytaleMods(
  query: string,
  index = 0,
): Promise<CurseForgeSearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      data: [],
      pagination: {
        index: 0,
        pageSize: MOD_SEARCH_PAGE_SIZE,
        resultCount: 0,
        totalCount: 0,
      },
    };
  }

  const payload = await curseforgeFetch<RawSearchResponse>("/mods/search", {
    gameId: HYTALE_GAME_ID,
    searchFilter: trimmed,
    index,
    pageSize: MOD_SEARCH_PAGE_SIZE,
    sortField: 2,
    sortOrder: "desc",
  });

  const data = (payload.data ?? [])
    .map((mod) => mapCurseForgeMod(mod as Parameters<typeof mapCurseForgeMod>[0]))
    .filter((mod): mod is NonNullable<typeof mod> => mod !== null);

  const pagination = payload.pagination ?? {};

  return {
    data,
    pagination: {
      index: pagination.index ?? index,
      pageSize: pagination.pageSize ?? MOD_SEARCH_PAGE_SIZE,
      resultCount: pagination.resultCount ?? data.length,
      totalCount: pagination.totalCount ?? data.length,
    },
  };
}
