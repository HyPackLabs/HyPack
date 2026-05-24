import Image from "next/image";
import { Trash2 } from "lucide-react";
import { CurseForgeModLink } from "@/components/modpacks/curseforge-mod-link";
import type { CurseForgeModSummary } from "@/lib/curseforge/types";
import { formatDownloads } from "@/lib/modpacks/format-downloads";

type SelectedModRowProps = {
  mod: CurseForgeModSummary;
  requiredForNames?: string[];
  onRemove: () => void;
};

export function SelectedModRow({
  mod,
  requiredForNames = [],
  onRemove,
}: SelectedModRowProps) {
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
        <p className="mt-0.5 text-xs text-zinc-500">
          {formatDownloads(mod.downloadCount)} downloads
        </p>
        <div className="mt-1.5">
          <CurseForgeModLink slug={mod.slug} />
        </div>
        {requiredForNames.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {requiredForNames.map((name) => (
              <span
                key={name}
                className="inline-flex max-w-full items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-200 ring-1 ring-amber-400/20"
                title={`Required for ${name}`}
              >
                <span className="truncate">Required for {name}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${mod.name}`}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-zinc-400 ring-1 ring-white/10 transition hover:bg-red-500/10 hover:text-red-300 hover:ring-red-400/20"
      >
        <Trash2 className="h-4 w-4" />
        Remove
      </button>
    </li>
  );
}
