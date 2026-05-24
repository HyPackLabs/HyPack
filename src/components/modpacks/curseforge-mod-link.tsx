import { ExternalLink } from "lucide-react";
import { getCurseForgeModPageUrl } from "@/lib/curseforge/get-mod-page-url";

type CurseForgeModLinkProps = {
  slug: string;
};

export function CurseForgeModLink({ slug }: CurseForgeModLinkProps) {
  return (
    <a
      href={getCurseForgeModPageUrl(slug)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-zinc-500 transition hover:text-violet-300"
    >
      View Mod
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
