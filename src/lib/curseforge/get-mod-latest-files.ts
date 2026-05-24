import { curseforgeFetch, curseforgePost } from "@/lib/curseforge/client";
import type { CurseForgeModLatestFile } from "@/lib/curseforge/types";

type RawModFile = {
  id?: number;
  fileName?: string;
  fileDate?: string;
  isAvailable?: boolean;
  downloadUrl?: string;
};

type RawMod = {
  id?: number;
  name?: string;
  slug?: string;
  authors?: Array<{ name?: string }>;
  latestFiles?: RawModFile[];
};

type RawModFilesResponse = {
  data?: RawModFile[];
};

type RawFileDetail = {
  modules?: Array<{ name?: string }>;
};

function pickLatestFile(files: RawModFile[] | undefined): RawModFile | null {
  if (!files?.length) {
    return null;
  }

  const candidates = files.filter((file) => file.isAvailable !== false);
  const pool = candidates.length > 0 ? candidates : files;

  return [...pool].sort((left, right) => {
    const leftTime = left.fileDate ? Date.parse(left.fileDate) : 0;
    const rightTime = right.fileDate ? Date.parse(right.fileDate) : 0;
    return rightTime - leftTime;
  })[0] ?? null;
}

async function fetchLatestFileFromList(modId: number): Promise<RawModFile | null> {
  const payload = await curseforgeFetch<RawModFilesResponse>(`/mods/${modId}/files`, {
    pageSize: 50,
  });

  return pickLatestFile(payload.data);
}

async function fetchFileModuleNames(
  modId: number,
  fileId: number,
): Promise<string[]> {
  const payload = await curseforgeFetch<{ data?: RawFileDetail }>(
    `/mods/${modId}/files/${fileId}`,
  );

  return (payload.data?.modules ?? [])
    .map((module) => module.name?.trim())
    .filter((name): name is string => Boolean(name));
}

function toLatestFile(
  mod: RawMod,
  file: RawModFile,
  moduleNames: string[],
): CurseForgeModLatestFile | null {
  if (typeof mod.id !== "number" || typeof file.id !== "number" || !file.fileName) {
    return null;
  }

  return {
    modId: mod.id,
    modName: mod.name ?? `Mod ${mod.id}`,
    modSlug: mod.slug ?? String(mod.id),
    authorName: mod.authors?.[0]?.name?.trim() ?? null,
    fileId: file.id,
    fileName: file.fileName,
    downloadUrl: file.downloadUrl,
    moduleNames,
  };
}

export async function getModLatestFiles(
  modIds: number[],
): Promise<Map<number, CurseForgeModLatestFile>> {
  const latestFiles = new Map<number, CurseForgeModLatestFile>();

  if (modIds.length === 0) {
    return latestFiles;
  }

  const payload = await curseforgePost<{ data?: unknown[] }>("/mods", {
    modIds,
    filterPcOnly: false,
  });

  await Promise.all(
    (payload.data ?? []).map(async (rawMod) => {
      const mod = rawMod as RawMod;
      if (typeof mod.id !== "number") {
        return;
      }

      let file = pickLatestFile(mod.latestFiles);
      if (!file) {
        file = await fetchLatestFileFromList(mod.id);
      }

      if (!file || typeof file.id !== "number") {
        return;
      }

      const moduleNames = await fetchFileModuleNames(mod.id, file.id).catch(
        (error) => {
          console.error(
            `Failed to fetch module names for mod ${mod.id} file ${file.id}:`,
            error,
          );
          return [];
        },
      );
      const mapped = toLatestFile(mod, file, moduleNames);
      if (mapped) {
        latestFiles.set(mod.id, mapped);
      }
    }),
  );

  return latestFiles;
}
