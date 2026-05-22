import { curseforgeFetch } from "@/lib/curseforge/client";
import { FILE_RELATION_TYPE } from "@/lib/curseforge/file-relation-types";

type RawFileDependency = {
  modId?: number;
  relationType?: number;
};

type RawFileDetail = {
  dependencies?: RawFileDependency[];
};

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
        dependency.relationType === FILE_RELATION_TYPE.RequiredDependency &&
        typeof dependency.modId === "number",
    )
    .map((dependency) => dependency.modId as number);
}
