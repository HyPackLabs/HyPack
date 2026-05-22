export const FILE_RELATION_TYPE = {
  EmbeddedLibrary: 1,
  OptionalDependency: 2,
  RequiredDependency: 3,
  Tool: 4,
  Incompatible: 5,
  Include: 6,
} as const;

export type FileRelationType =
  (typeof FILE_RELATION_TYPE)[keyof typeof FILE_RELATION_TYPE];
