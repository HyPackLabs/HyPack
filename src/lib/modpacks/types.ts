import type { PackDependencyState } from "@/lib/modpacks/mod-dependency-selection";

export type ModpackVisibility = "Private" | "Unlisted" | "Public";

export type ModpackCreator = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

export type Modpack = {
  id: string;
  title: string;
  description: string;
  modCount: number;
  visibility: ModpackVisibility;
  updatedAt: string;
  iconUrl: string | null;
  likes: number;
};

export type PublicModpack = Modpack & {
  creatorId: string;
  creator: ModpackCreator;
  likedByUser: boolean;
};

export type ModpackDetail = {
  id: string;
  title: string;
  description: string;
  visibility: ModpackVisibility;
  createdAt: string;
  likes: number;
  likedByUser: boolean;
  modIds: number[];
  isOwner: boolean;
  iconUrl: string | null;
  dependencyState: PackDependencyState | null;
};
