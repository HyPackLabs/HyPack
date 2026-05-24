export const EXPORT_README_FILENAME = "README.txt";
export const EXPORT_MODS_FOLDER = "mods";

export function sanitizeExportFilename(title: string): string {
  const sanitized = title
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return sanitized || "modpack";
}

function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex) : "";
}

function getFileBaseName(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(0, dotIndex) : fileName;
}

function isZipArchiveBuffer(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
    (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08)
  );
}

export function ensureModExportFileName(
  fileName: string,
  buffer: Buffer,
): string {
  if (getFileExtension(fileName)) {
    return fileName;
  }

  if (isZipArchiveBuffer(buffer)) {
    return `${fileName}.zip`;
  }

  return fileName;
}

export function getUniqueZipEntryName(
  fileName: string,
  modSlug: string,
  usedNames: Set<string>,
): string {
  const tryNames = [
    fileName,
    `${modSlug}-${fileName}`,
    `${modSlug}-${getFileBaseName(fileName)}${getFileExtension(fileName)}`,
  ];

  for (const candidate of tryNames) {
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return candidate;
    }
  }

  let counter = 2;
  while (true) {
    const candidate = `${getFileBaseName(fileName)}-${counter}${getFileExtension(fileName)}`;
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return candidate;
    }
    counter += 1;
  }
}

export function buildReadme(title: string, modCount: number): string {
  return [
    `HyPack modpack: ${title}`,
    "",
    modCount === 0
      ? "This modpack does not contain any mods yet."
      : `This archive contains ${modCount} mod file${modCount === 1 ? "" : "s"} from CurseForge in the mods/ folder.`,
    "",
    "Archive layout:",
    "  README.txt",
    "  config.json",
    "  mods/",
    "",
    "Client install:",
    "  Copy the files from mods/ into your Hytale Mods folder:",
    "    Windows: %appdata%\\Hytale\\UserData\\Mods\\",
    "    macOS:   ~/Library/Application Support/Hytale/UserData/Mods/",
    "    Linux:   ~/.local/share/Hytale/UserData/Mods/",
    "",
    "Dedicated server install:",
    "  Extract this archive to your server root so config.json sits beside your server files",
    "  and the downloaded mod files remain in mods/.",
    "  config.json enables every mod in this pack.",
    "",
    "Do not unzip individual mod files unless the mod author says to.",
    "",
    "Exported from HyPack.",
  ].join("\n");
}
