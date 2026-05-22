import { curseforgeFetch } from "@/lib/curseforge/client";

type DownloadUrlResponse = {
  data?: string;
};

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

export async function downloadModFileBuffer(downloadUrl: string): Promise<Buffer> {
  const response = await fetch(downloadUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}).`);
  }

  return Buffer.from(await response.arrayBuffer());
}
