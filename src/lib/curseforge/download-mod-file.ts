import { curseforgeFetch } from "@/lib/curseforge/client";

type DownloadUrlResponse = {
  data?: string;
};

const DOWNLOAD_HEADERS = {
  "User-Agent": "HyPack/1.0 (+https://hypack.gg)",
  Referer: "https://www.curseforge.com/",
};

const DOWNLOAD_RETRY_STATUSES = new Set([403, 408, 429, 500, 502, 503, 504]);
const DOWNLOAD_MAX_ATTEMPTS = 3;

export function buildCurseForgeCdnDownloadUrl(
  fileId: number,
  fileName: string,
): string {
  const id = String(fileId);
  const prefix = id.slice(0, 4);
  const suffix = id.slice(4);

  return `https://edge.forgecdn.net/files/${prefix}/${suffix}/${fileName}`;
}

function isDownloadUrlApiForbidden(error: unknown): boolean {
  return (
    error instanceof Error &&
    /CurseForge API error \(403\)/.test(error.message)
  );
}

export async function getModFileDownloadUrl(
  modId: number,
  fileId: number,
): Promise<string> {
  const payload = await curseforgeFetch<DownloadUrlResponse>(
    `/mods/${modId}/files/${fileId}/download-url`,
  );

  if (!payload.data) {
    throw new Error("CurseForge did not return a download URL.");
  }

  return payload.data;
}

export async function resolveModFileDownloadUrl(
  modId: number,
  fileId: number,
  fileName: string,
): Promise<string> {
  try {
    return await getModFileDownloadUrl(modId, fileId);
  } catch (error) {
    if (!isDownloadUrlApiForbidden(error)) {
      throw error;
    }
  }

  return buildCurseForgeCdnDownloadUrl(fileId, fileName);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function downloadModFileBuffer(downloadUrl: string): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= DOWNLOAD_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(downloadUrl, {
        cache: "no-store",
        redirect: "follow",
        headers: DOWNLOAD_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`Download failed (${response.status}).`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length === 0) {
        throw new Error("Download returned an empty file.");
      }

      return buffer;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Download failed.");

      const statusMatch = lastError.message.match(/\((\d{3})\)/);
      const status = statusMatch ? Number(statusMatch[1]) : null;
      const shouldRetry =
        attempt < DOWNLOAD_MAX_ATTEMPTS &&
        (status === null || DOWNLOAD_RETRY_STATUSES.has(status));

      if (!shouldRetry) {
        throw lastError;
      }

      await sleep(250 * attempt);
    }
  }

  throw lastError ?? new Error("Download failed.");
}

export async function downloadModFile(
  modId: number,
  fileId: number,
  fileName: string,
): Promise<Buffer> {
  const downloadUrl = await resolveModFileDownloadUrl(modId, fileId, fileName);
  return downloadModFileBuffer(downloadUrl);
}
