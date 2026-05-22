import { getModFileRequiredDependencyIds } from "@/lib/curseforge/get-mod-file-dependencies";
import { getModLatestFiles } from "@/lib/curseforge/get-mod-latest-files";
import { getModsByIds } from "@/lib/curseforge/get-mods-by-ids";
import type { CurseForgeModSummary } from "@/lib/curseforge/types";

export type ResolvedRequiredDependencies = {
  dependencies: CurseForgeModSummary[];
  /** Direct requester mod IDs for each dependency mod ID. */
  requiredBy: Record<number, number[]>;
  /** Direct required dependency mod IDs for each requester mod ID. */
  directRequiredDeps: Record<number, number[]>;
};

export async function resolveRequiredDependencies(
  rootModIds: number[],
): Promise<ResolvedRequiredDependencies> {
  const requiredBy = new Map<number, Set<number>>();
  const directRequiredDeps = new Map<number, number[]>();
  const allDependencyIds = new Set<number>();
  const visited = new Set<number>();
  let frontier = [...rootModIds];

  for (const modId of rootModIds) {
    visited.add(modId);
  }

  while (frontier.length > 0) {
    const latestFiles = await getModLatestFiles(frontier);
    const nextFrontier: number[] = [];

    for (const modId of frontier) {
      const file = latestFiles.get(modId);
      if (!file) {
        directRequiredDeps.set(modId, []);
        continue;
      }

      const dependencyIds = await getModFileRequiredDependencyIds(
        modId,
        file.fileId,
      );
      directRequiredDeps.set(modId, dependencyIds);

      for (const dependencyId of dependencyIds) {
        if (!requiredBy.has(dependencyId)) {
          requiredBy.set(dependencyId, new Set());
        }
        requiredBy.get(dependencyId)!.add(modId);
        allDependencyIds.add(dependencyId);

        if (!visited.has(dependencyId)) {
          visited.add(dependencyId);
          nextFrontier.push(dependencyId);
        }
      }
    }

    frontier = nextFrontier;
  }

  const dependencies = await getModsByIds([...allDependencyIds]);

  return {
    dependencies,
    requiredBy: mapSetRecordToArrays(requiredBy),
    directRequiredDeps: Object.fromEntries(directRequiredDeps),
  };
}

function mapSetRecordToArrays(
  source: Map<number, Set<number>>,
): Record<number, number[]> {
  return Object.fromEntries(
    [...source.entries()].map(([dependencyId, requesterIds]) => [
      dependencyId,
      [...requesterIds],
    ]),
  );
}
