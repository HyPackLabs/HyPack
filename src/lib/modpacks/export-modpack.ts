import JSZip from "jszip";
import { isCurseForgeConfigured } from "@/lib/curseforge/client";
import {
  downloadModFileBuffer,
  getModFileDownloadUrl,
} from "@/lib/curseforge/download-mod-file";
import { getModLatestFiles } from "@/lib/curseforge/get-mod-latest-files";
import {
  buildExportConfigJson,
  EXPORT_CONFIG_FILENAME,
} from "@/lib/modpacks/build-export-config";
import {
  buildReadme,
  EXPORT_MODS_FOLDER,
  EXPORT_README_FILENAME,
  ensureModExportFileName,
  getUniqueZipEntryName,
  sanitizeExportFilename,
} from "@/lib/modpacks/export-filename";
import {
  extractModIdentifiersFromBuffer,
  resolveModIdentifiers,
} from "@/lib/modpacks/extract-mod-identifiers";
import { getModpackDetailForViewer } from "@/lib/modpacks/get-modpack-detail";
import {
  formatModArchiveValidationError,
  validateModArchive,
} from "@/lib/modpacks/validate-mod-archive";

export type ExportModpackResult =
  | { ok: true; buffer: Buffer; filename: string }
  | { ok: false; error: string };

export async function exportModpackZip(
  viewerUserId: string | null,
  modpackId: string,
): Promise<ExportModpackResult> {
  const modpack = await getModpackDetailForViewer(viewerUserId, modpackId);

  if (!modpack) {
    return { ok: false, error: "Modpack not found." };
  }

  if (!isCurseForgeConfigured()) {
    return { ok: false, error: "CurseForge is not configured." };
  }

  const zip = new JSZip();
  const usedModNames = new Set<string>();
  const modConfigIdentifiers: string[] = [];

  zip.file(EXPORT_README_FILENAME, buildReadme(modpack.title, modpack.modIds.length));

  if (modpack.modIds.length > 0) {
    const latestFiles = await getModLatestFiles(modpack.modIds);
    const failedMods: string[] = [];
    const invalidMods: string[] = [];

    for (const modId of modpack.modIds) {
      const file = latestFiles.get(modId);

      if (!file) {
        failedMods.push(`Mod #${modId}`);
        continue;
      }

      try {
        const downloadUrl =
          file.downloadUrl ?? (await getModFileDownloadUrl(modId, file.fileId));
        const fileBuffer = await downloadModFileBuffer(downloadUrl);
        const validation = await validateModArchive(fileBuffer, file.fileName);

        if (!validation.ok) {
          invalidMods.push(
            formatModArchiveValidationError(file.modName, validation.suspiciousFiles),
          );
          continue;
        }

        const modFileName = getUniqueZipEntryName(
          ensureModExportFileName(file.fileName, fileBuffer),
          file.modSlug,
          usedModNames,
        );

        zip.file(`${EXPORT_MODS_FOLDER}/${modFileName}`, fileBuffer);

        const manifestIds = await extractModIdentifiersFromBuffer(fileBuffer);
        modConfigIdentifiers.push(
          ...resolveModIdentifiers(manifestIds, {
            modName: file.modName,
            authorName: file.authorName,
            moduleNames: file.moduleNames,
          }),
        );
      } catch (error) {
        console.error(`Failed to download mod ${modId}:`, error);
        failedMods.push(file.modName);
      }
    }

    if (invalidMods.length > 0) {
      return {
        ok: false,
        error: `Export blocked: ${invalidMods.join(" ")}`,
      };
    }

    if (failedMods.length > 0) {
      return {
        ok: false,
        error: `Could not download ${failedMods.length === 1 ? "a mod" : "some mods"}: ${failedMods.join(", ")}.`,
      };
    }
  } else {
    zip.folder(EXPORT_MODS_FOLDER);
  }

  zip.file(EXPORT_CONFIG_FILENAME, buildExportConfigJson(modConfigIdentifiers));

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return {
    ok: true,
    buffer,
    filename: `${sanitizeExportFilename(modpack.title)}.zip`,
  };
}
