import { curseforgeFetch } from "@/lib/curseforge/client";
import { FILE_RELATION_TYPE } from "@/lib/curseforge/file-relation-types";

type RawFileDependency = {
  modId?: number;
  relationType?: number;
};

type RawFileDetail = {
  dependencies?: RawFileDependency[];
};

const REQUIRED_LIKE_RELATION_TYPES = new Set<number>([
  FILE_RELATION_TYPE.EmbeddedLibrary,
  FILE_RELATION_TYPE.RequiredDependency,
  FILE_RELATION_TYPE.Include,
]);

export async function getModFileRequiredDependencyIds(
  modId: number,
  fileId: number,
): Promise<number[]> {
  const payload = await curseforgeFetch<{ data?: RawFileDetail }>(
    `/mods/${modId}/files/${fileId}`,
  );

  return (payload.data?.dependencies ?? [])
    .filter(
      (dependency) =>
        typeof dependency.relationType === "number" &&
        REQUIRED_LIKE_RELATION_TYPES.has(dependency.relationType) &&
        typeof dependency.modId === "number",
    )
    .map((dependency) => dependency.modId as number);
}
