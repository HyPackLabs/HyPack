export type CurseForgeModSummary = {
  id: number;
  name: string;
  slug: string;
  summary: string;
  downloadCount: number;
  logoUrl: string | null;
};

export type CurseForgeSearchResponse = {
  data: CurseForgeModSummary[];
  pagination: {
    index: number;
    pageSize: number;
    resultCount: number;
    totalCount: number;
  };
};

export type CurseForgeModLatestFile = {
  modId: number;
  modName: string;
  modSlug: string;
  authorName: string | null;
  fileId: number;
  fileName: string;
  downloadUrl?: string;
  moduleNames: string[];
};
