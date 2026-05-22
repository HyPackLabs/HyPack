import JSZip from "jszip";

type PluginManifest = {
  Group?: string;
  Name?: string;
  SubPlugins?: PluginManifest[];
};

function collectManifestIdentifiers(
  manifest: PluginManifest,
  parentGroup?: string,
): string[] {
  const group = manifest.Group?.trim() || parentGroup;
  const identifiers: string[] = [];

  if (manifest.Name?.trim() && group) {
    identifiers.push(`${group}:${manifest.Name.trim()}`);
  }

  for (const subPlugin of manifest.SubPlugins ?? []) {
    identifiers.push(...collectManifestIdentifiers(subPlugin, group));
  }

  return identifiers;
}

function normalizeModuleName(name: string): string | null {
  const trimmed = name.trim();
  return trimmed.includes(":") ? trimmed : null;
}

export type ModIdentifierFallback = {
  modName: string;
  authorName: string | null;
  moduleNames: string[];
};

export function resolveModIdentifiers(
  manifestIds: string[],
  fallback: ModIdentifierFallback,
): string[] {
  const identifiers = new Set<string>();

  for (const id of manifestIds) {
    identifiers.add(id);
  }

  for (const moduleName of fallback.moduleNames) {
    const normalized = normalizeModuleName(moduleName);
    if (normalized) {
      identifiers.add(normalized);
    }
  }

  if (identifiers.size === 0 && fallback.authorName && fallback.modName) {
    identifiers.add(`${fallback.authorName}:${fallback.modName}`);
  }

  return [...identifiers];
}

export async function extractModIdentifiersFromBuffer(
  buffer: Buffer,
): Promise<string[]> {
  const identifiers = new Set<string>();

  try {
    const archive = await JSZip.loadAsync(buffer);
    const manifestPaths = Object.entries(archive.files)
      .filter(([path, file]) => !file.dir && path.endsWith("manifest.json"))
      .sort(([leftPath], [rightPath]) => {
        const leftDepth = leftPath.split("/").length;
        const rightDepth = rightPath.split("/").length;
        return leftDepth - rightDepth;
      });

    for (const [, file] of manifestPaths) {
      try {
        const content = await file.async("string");
        const manifest = JSON.parse(content) as PluginManifest;

        for (const id of collectManifestIdentifiers(manifest)) {
          identifiers.add(id);
        }
      } catch {
        // Skip unreadable manifests and continue with other files in the archive.
      }
    }
  } catch {
    // Not a zip/jar archive HyPack can inspect.
  }

  return [...identifiers];
}
