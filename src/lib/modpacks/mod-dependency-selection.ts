import type { CurseForgeModSummary } from "@/lib/curseforge/types";
import type { ResolvedRequiredDependencies } from "@/lib/curseforge/resolve-required-dependencies";

export type PackDependencyState = {
  requiredBy: Record<number, number[]>;
  directRequiredDeps: Record<number, number[]>;
  userAddedModIds: number[];
};

export const EMPTY_PACK_DEPENDENCY_STATE: PackDependencyState = {
  requiredBy: {},
  directRequiredDeps: {},
  userAddedModIds: [],
};

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

function parseIdRecord(value: unknown): Record<number, number[]> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const parsed: Record<number, number[]> = {};

  for (const [key, requesters] of Object.entries(value)) {
    const dependencyId = Number(key);
    if (!Number.isInteger(dependencyId) || dependencyId <= 0) {
      continue;
    }

    if (!Array.isArray(requesters)) {
      continue;
    }

    const normalizedRequesters = requesters.filter(
      (requesterId): requesterId is number =>
        typeof requesterId === "number" && Number.isInteger(requesterId),
    );

    if (normalizedRequesters.length > 0) {
      parsed[dependencyId] = normalizedRequesters;
    }
  }

  return parsed;
}

export function parsePackDependencyState(
  value: unknown,
): PackDependencyState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const requiredBy = parseIdRecord(record.requiredBy);
  const directRequiredDeps = parseIdRecord(record.directRequiredDeps);
  const userAddedModIds = Array.isArray(record.userAddedModIds)
    ? record.userAddedModIds.filter(
        (modId): modId is number =>
          typeof modId === "number" && Number.isInteger(modId) && modId > 0,
      )
    : [];

  return {
    requiredBy,
    directRequiredDeps,
    userAddedModIds,
  };
}

export function sanitizePackDependencyState(
  modIds: number[],
  state: PackDependencyState | null | undefined,
): PackDependencyState | null {
  if (!state) {
    return null;
  }

  const modIdSet = new Set(modIds);
  const requiredBy: Record<number, number[]> = {};

  for (const [dependencyId, requesterIds] of Object.entries(state.requiredBy)) {
    const normalizedDependencyId = Number(dependencyId);
    if (!modIdSet.has(normalizedDependencyId)) {
      continue;
    }

    const filteredRequesters = requesterIds.filter((requesterId) =>
      modIdSet.has(requesterId),
    );

    if (filteredRequesters.length > 0) {
      requiredBy[normalizedDependencyId] = filteredRequesters;
    }
  }

  const directRequiredDeps: Record<number, number[]> = {};

  for (const [requesterId, dependencyIds] of Object.entries(
    state.directRequiredDeps,
  )) {
    const normalizedRequesterId = Number(requesterId);
    if (!modIdSet.has(normalizedRequesterId)) {
      continue;
    }

    directRequiredDeps[normalizedRequesterId] = dependencyIds.filter(
      (dependencyId) => modIdSet.has(dependencyId),
    );
  }

  const userAddedModIds = state.userAddedModIds.filter((modId) =>
    modIdSet.has(modId),
  );

  if (
    Object.keys(requiredBy).length === 0 &&
    Object.keys(directRequiredDeps).length === 0 &&
    userAddedModIds.length === 0
  ) {
    return null;
  }

  return {
    requiredBy,
    directRequiredDeps,
    userAddedModIds,
  };
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
