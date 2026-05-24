import Image from "next/image";
import { Loader2, Plus } from "lucide-react";
import { CurseForgeModLink } from "@/components/modpacks/curseforge-mod-link";
import type { CurseForgeModSummary } from "@/lib/curseforge/types";
import { formatDownloads } from "@/lib/modpacks/format-downloads";

type ModSearchResultRowProps = {
  mod: CurseForgeModSummary;
  isAdded: boolean;
  isAdding: boolean;
  onAdd: () => void;
};

export function ModSearchResultRow({
  mod,
  isAdded,
  isAdding,
  onAdd,
}: ModSearchResultRowProps) {
  const isDisabled = isAdded || isAdding;

  return (
    <li className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#111111] p-4">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
        {mod.logoUrl ? (
          <Image
            src={mod.logoUrl}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-600">
            {mod.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-white">{mod.name}</p>
        {mod.summary ? (
          <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">
            {mod.summary}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-zinc-600">
          {formatDownloads(mod.downloadCount)} downloads
        </p>
        <div className="mt-1.5">
          <CurseForgeModLink slug={mod.slug} />
        </div>
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={isDisabled}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 py-2 text-sm font-medium text-violet-200 ring-1 ring-violet-400/25 transition hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAdding ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding…
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            {isAdded ? "Added" : "Add"}
          </>
        )}
      </button>
    </li>
  );
}
