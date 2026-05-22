import fs from "fs";
import path from "path";

const EXPECTED_KEY_PREFIX = "$2a$10$";

/**
 * Next.js expands `$` in .env values, which corrupts CurseForge keys.
 * Read the raw value from disk when process.env looks wrong.
 */
export function loadCurseForgeApiKey(): string | null {
  const fromProcess = process.env.CURSEFORGE_API_KEY?.trim();
  if (isValidCurseForgeKey(fromProcess)) {
    return fromProcess!;
  }

  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return null;
  }

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.startsWith("CURSEFORGE_API_KEY=")) {
      continue;
    }

    let value = line.slice("CURSEFORGE_API_KEY=".length).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    value = value.replace(/\\\$/g, "$");

    if (isValidCurseForgeKey(value)) {
      return value;
    }
  }

  return null;
}

export function isValidCurseForgeKey(key: string | undefined | null): boolean {
  return Boolean(
    key &&
      key.startsWith(EXPECTED_KEY_PREFIX) &&
      key.length >= 50,
  );
}
