import { resolveRequiredDependencies } from "@/lib/curseforge/resolve-required-dependencies";
import {
  mergeRequiredByMaps,
  type PackDependencyState,
} from "@/lib/modpacks/mod-dependency-selection";

export async function buildPackDependencyState(
  modIds: number[],
): Promise<PackDependencyState> {
  if (modIds.length === 0) {
    return {
      requiredBy: {},
      directRequiredDeps: {},
      userAddedModIds: [],
    };
  }

  const modIdSet = new Set(modIds);
  let requiredBy: Record<number, number[]> = {};
  const directRequiredDeps: Record<number, number[]> = {};
  const dependencyIds = new Set<number>();

  for (const modId of modIds) {
    const resolution = await resolveRequiredDependencies([modId]);
    const inPackDirectDeps = (resolution.directRequiredDeps[modId] ?? []).filter(
      (dependencyId) => modIdSet.has(dependencyId),
    );

    directRequiredDeps[modId] = inPackDirectDeps;

    for (const dependencyId of inPackDirectDeps) {
      dependencyIds.add(dependencyId);
    }

    const filteredRequiredBy: Record<number, number[]> = {};

    for (const [dependencyIdStr, requesterIds] of Object.entries(
      resolution.requiredBy,
    )) {
      const dependencyId = Number(dependencyIdStr);
      if (!modIdSet.has(dependencyId)) {
        continue;
      }

      const filteredRequesters = requesterIds.filter((requesterId) =>
        modIdSet.has(requesterId),
      );

      if (filteredRequesters.length > 0) {
        filteredRequiredBy[dependencyId] = filteredRequesters;
      }
    }

    requiredBy = mergeRequiredByMaps(requiredBy, filteredRequiredBy);
  }

  return {
    requiredBy,
    directRequiredDeps,
    userAddedModIds: modIds.filter((modId) => !dependencyIds.has(modId)),
  };
}
