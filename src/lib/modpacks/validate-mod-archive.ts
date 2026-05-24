import JSZip from "jszip";

const ALLOWED_MOD_EXTENSIONS = new Set([".jar", ".zip"]);

// Reverse-engineering / decompiler database artifacts that should never ship in a mod.
const BLOCKED_EXTENSIONS = new Set([
  ".gpr",
  ".rep",
  ".gdb",
  ".idb",
  ".i64",
  ".id0",
  ".id1",
  ".id2",
  ".nam",
  ".til",
]);

const BLOCKED_PATH_PATTERNS = [
  /^__MACOSX\//i,
  /^\.git(\/|$)/i,
  /^\.idea(\/|$)/i,
  /^\.vscode(\/|$)/i,
  /^node_modules(\/|$)/i,
  /^\.gradle(\/|$)/i,
  /^\.vs(\/|$)/i,
  /^target\//i,
  /^build\//i,
  /^build$/i,
  /\/\.DS_Store$/i,
  /^Thumbs\.db$/i,
  /^desktop\.ini$/i,
] as const;

export type ModArchiveValidationResult =
  | { ok: true }
  | { ok: false; suspiciousFiles: string[] };

function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
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

type ModFileKind = "jar" | "zip" | "invalid";

function resolveModFileKind(fileName: string, buffer: Buffer): ModFileKind {
  const extension = getFileExtension(fileName);

  if (extension === ".jar") {
    return "jar";
  }

  if (extension === ".zip") {
    return "zip";
  }

  if (isZipArchiveBuffer(buffer)) {
    return "zip";
  }

  return "invalid";
}

function isSuspiciousArchivePath(path: string): boolean {
  const extension = getFileExtension(path);
  if (BLOCKED_EXTENSIONS.has(extension)) {
    return true;
  }

  return BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function validateModFileName(fileName: string, buffer: Buffer): string[] {
  const extension = getFileExtension(fileName);

  if (BLOCKED_EXTENSIONS.has(extension)) {
    return [fileName];
  }

  if (resolveModFileKind(fileName, buffer) === "invalid") {
    return [`unsupported mod file type "${extension || "none"}"`];
  }

  return [];
}

async function validateJarContents(
  buffer: Buffer,
): Promise<string[]> {
  const suspiciousFiles: string[] = [];

  try {
    const archive = await JSZip.loadAsync(buffer);

    for (const [path, entry] of Object.entries(archive.files)) {
      if (entry.dir) {
        if (isSuspiciousArchivePath(`${path}/`)) {
          suspiciousFiles.push(path.replace(/\/$/, ""));
        }
        continue;
      }

      if (isSuspiciousArchivePath(path)) {
        suspiciousFiles.push(path);
      }
    }
  } catch {
    // Unreadable plugin archives are rejected upstream by the game client.
  }

  return suspiciousFiles;
}

export async function validateModArchive(
  buffer: Buffer,
  fileName: string,
): Promise<ModArchiveValidationResult> {
  const suspiciousFiles = validateModFileName(fileName, buffer);
  const modFileKind = resolveModFileKind(fileName, buffer);

  if (modFileKind === "jar") {
    suspiciousFiles.push(...(await validateJarContents(buffer)));
  }

  const uniqueSuspiciousFiles = [...new Set(suspiciousFiles)];
  if (uniqueSuspiciousFiles.length === 0) {
    return { ok: true };
  }

  return {
    ok: false,
    suspiciousFiles: uniqueSuspiciousFiles.slice(0, 8),
  };
}

export function formatModArchiveValidationError(
  modName: string,
  suspiciousFiles: string[],
): string {
  const fileList = suspiciousFiles.join(", ");
  const overflow = suspiciousFiles.length >= 8 ? " (showing first 8)" : "";

  return `"${modName}" contains developer tool artifacts: ${fileList}${overflow}. Remove it from the pack or report the upload on CurseForge.`;
}
