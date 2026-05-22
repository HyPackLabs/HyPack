import { CURSEFORGE_API_BASE } from "@/lib/curseforge/constants";
import {
  isValidCurseForgeKey,
  loadCurseForgeApiKey,
} from "@/lib/curseforge/load-api-key";

export function isCurseForgeConfigured(): boolean {
  return loadCurseForgeApiKey() !== null;
}

export function getCurseForgeKeyError(): string | null {
  if (loadCurseForgeApiKey()) {
    return null;
  }

  const fromProcess = process.env.CURSEFORGE_API_KEY?.trim();
  if (!fromProcess) {
    return "CURSEFORGE_API_KEY is not set in .env.";
  }

  if (!isValidCurseForgeKey(fromProcess)) {
    return (
      "CURSEFORGE_API_KEY in .env was corrupted by $ expansion. " +
      "HyPack reads the raw key from .env automatically — restart the dev server after saving."
    );
  }

  return "CURSEFORGE_API_KEY is not configured.";
}

export async function curseforgeFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const apiKey = loadCurseForgeApiKey();
  if (!apiKey) {
    throw new Error(getCurseForgeKeyError() ?? "CURSEFORGE_API_KEY is not configured");
  }

  const url = new URL(`${CURSEFORGE_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-api-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `CurseForge API error (${response.status}): ${body.slice(0, 200)}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function curseforgePost<T>(path: string, body: object): Promise<T> {
  const apiKey = loadCurseForgeApiKey();
  if (!apiKey) {
    throw new Error(getCurseForgeKeyError() ?? "CURSEFORGE_API_KEY is not configured");
  }

  const response = await fetch(`${CURSEFORGE_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `CurseForge API error (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  return response.json() as Promise<T>;
}
