export const EXPORT_CONFIG_FILENAME = "config.json";

const DEFAULT_EXPORT_CONFIG = {
  Backup: {
    Enabled: true,
    FrequencyMinutes: 30,
    Directory: "backup",
    MaxCount: 5,
    ArchiveMaxCount: 5,
  },
  Version: 4,
} as const;

export function buildExportConfigJson(modIdentifiers: string[]): string {
  const mods: Record<string, { Enabled: true }> = {};

  for (const identifier of [...new Set(modIdentifiers)].sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: "base" }),
  )) {
    mods[identifier] = { Enabled: true };
  }

  const config = {
    ...DEFAULT_EXPORT_CONFIG,
    Mods: mods,
  };

  return `${JSON.stringify(config, null, 2)}\n`;
}
