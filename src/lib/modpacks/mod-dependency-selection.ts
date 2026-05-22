import type { CurseForgeModSummary } from "@/lib/curseforge/types";
import type { ResolvedRequiredDependencies } from "@/lib/curseforge/resolve-required-dependencies";

export function mergeRequiredByMaps(
  current: Record<number, number[]>,
  incoming: Record<number, number[]>,
): Record<number, number[]> {
  const next = { ...current };

  for (const [dependencyIdStr, requesterIds] of Object.entries(incoming)) {
    const dependencyId = Number(dependencyIdStr);
    const merged = new Set([...(next[dependencyId] ?? []), ...requesterIds]);
    next[dependencyId] = [...merged];
  }

  return next;
}

export function mergeDirectRequiredDepsMaps(
  current: Record<number, number[]>,
  incoming: Record<number, number[]>,
): Record<number, number[]> {
  return { ...current, ...incoming };
}

export function collectCascadeRemovals(
  removedModId: number,
  userAddedModIds: Set<number>,
  requiredBy: Record<number, number[]>,
  directRequiredDeps: Record<number, number[]>,
): Set<number> {
  const toRemove = new Set<number>([removedModId]);
  let changed = true;

  while (changed) {
    changed = false;

    for (const modId of [...toRemove]) {
      for (const dependencyId of directRequiredDeps[modId] ?? []) {
        if (toRemove.has(dependencyId) || userAddedModIds.has(dependencyId)) {
          continue;
        }

        const remainingRequesters = (requiredBy[dependencyId] ?? []).filter(
          (requesterId) => !toRemove.has(requesterId),
        );

        if (remainingRequesters.length === 0) {
          toRemove.add(dependencyId);
          changed = true;
        }
      }
    }
  }

  return toRemove;
}

export function pruneDependencyMaps(
  requiredBy: Record<number, number[]>,
  directRequiredDeps: Record<number, number[]>,
  removedModIds: Set<number>,
): {
  requiredBy: Record<number, number[]>;
  directRequiredDeps: Record<number, number[]>;
} {
  const nextRequiredBy: Record<number, number[]> = {};

  for (const [dependencyIdStr, requesterIds] of Object.entries(requiredBy)) {
    const dependencyId = Number(dependencyIdStr);
    if (removedModIds.has(dependencyId)) {
      continue;
    }

    const filteredRequesters = requesterIds.filter(
      (requesterId) => !removedModIds.has(requesterId),
    );

    if (filteredRequesters.length > 0) {
      nextRequiredBy[dependencyId] = filteredRequesters;
    }
  }

  const nextDirectRequiredDeps = Object.fromEntries(
    Object.entries(directRequiredDeps).filter(
      ([requesterIdStr]) => !removedModIds.has(Number(requesterIdStr)),
    ),
  );

  return {
    requiredBy: nextRequiredBy,
    directRequiredDeps: nextDirectRequiredDeps,
  };
}

export function getRequiredForNames(
  modId: number,
  requiredBy: Record<number, number[]>,
  modNameById: Map<number, string>,
): string[] {
  return (requiredBy[modId] ?? [])
    .map((requesterId) => modNameById.get(requesterId))
    .filter((name): name is string => Boolean(name));
}

export function applyDependencyResolution(
  currentMods: CurseForgeModSummary[],
  mod: CurseForgeModSummary,
  resolution: ResolvedRequiredDependencies,
): CurseForgeModSummary[] {
  const existingIds = new Set(currentMods.map((entry) => entry.id));
  const modsToAppend: CurseForgeModSummary[] = [];

  if (!existingIds.has(mod.id)) {
    modsToAppend.push(mod);
    existingIds.add(mod.id);
  }

  for (const dependency of resolution.dependencies) {
    if (!existingIds.has(dependency.id)) {
      modsToAppend.push(dependency);
      existingIds.add(dependency.id);
    }
  }

  return modsToAppend.length > 0 ? [...currentMods, ...modsToAppend] : currentMods;
}
