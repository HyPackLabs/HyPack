import JSZip from "jszip";

const ALLOWED_MOD_EXTENSIONS = new Set([".jar", ".zip"]);

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
  ".bak",
  ".tmp",
  ".log",
  ".iml",
]);

const BLOCKED_PATH_PATTERNS = [
  /^__MACOSX\//i,
  /^\.git(\/|$)/i,
  /^\.idea(\/|$)/i,
  /^\.vscode(\/|$)/i,
  /^node_modules(\/|$)/i,
  /^\.gradle(\/|$)/i,
  /^\.vs(\/|$)/i,
  /^target(\/|$)/i,
  /^build(\/|$)/i,
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

function isSuspiciousArchivePath(path: string): boolean {
  const extension = getFileExtension(path);
  if (BLOCKED_EXTENSIONS.has(extension)) {
    return true;
  }

  return BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function validateModFileName(fileName: string): string[] {
  const extension = getFileExtension(fileName);

  if (BLOCKED_EXTENSIONS.has(extension)) {
    return [fileName];
  }

  if (!ALLOWED_MOD_EXTENSIONS.has(extension)) {
    return [`unsupported mod file type "${extension || "none"}"`];
  }

  return [];
}

export async function validateModArchive(
  buffer: Buffer,
  fileName: string,
): Promise<ModArchiveValidationResult> {
  const suspiciousFiles = validateModFileName(fileName);

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
    if (suspiciousFiles.length > 0) {
      return { ok: false, suspiciousFiles: [...new Set(suspiciousFiles)] };
    }

    return { ok: true };
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

  return `"${modName}" contains non-mod files: ${fileList}${overflow}. Remove it from the pack or report the upload on CurseForge.`;
}
