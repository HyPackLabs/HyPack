import Image from "next/image";
import { CheckCircle2, Download, ExternalLink } from "lucide-react";
import type { CurseForgeModSummary } from "@/lib/curseforge/types";
import { formatDownloads } from "@/lib/modpacks/format-downloads";

type ModpackDetailModCardProps = {
  mod: CurseForgeModSummary;
  layout: "list" | "grid";
};

const cardClass =
  "rounded-xl border border-white/5 bg-[#111111] transition hover:border-white/10 hover:bg-[#141414]";

export function ModpackDetailModCard({ mod, layout }: ModpackDetailModCardProps) {
  if (layout === "grid") {
    return (
      <article className={`flex h-full flex-col p-5 ${cardClass}`}>
        <div className="relative mb-4 h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
          {mod.logoUrl ? (
            <Image
              src={mod.logoUrl}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-zinc-600">
              {mod.name.charAt(0)}
            </div>
          )}
        </div>
        <h3 className="font-semibold text-white">{mod.name}</h3>
        {mod.summary ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">
            {mod.summary}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <Download className="h-4 w-4 shrink-0" />
            {formatDownloads(mod.downloadCount)} downloads
          </span>
          <span className="inline-flex items-center gap-1.5 text-zinc-400">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400/80" />
            Latest
          </span>
        </div>
        <a
          href={`https://www.curseforge.com/hytale/mods/${mod.slug}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-violet-300"
        >
          CurseForge
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </article>
    );
  }

  return (
    <article className={`flex gap-5 p-5 sm:gap-6 sm:p-6 ${cardClass}`}>
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10 sm:h-20 sm:w-20">
        {mod.logoUrl ? (
          <Image
            src={mod.logoUrl}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-zinc-600">
            {mod.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white">{mod.name}</h3>
          {mod.summary ? (
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {mod.summary}
            </p>
          ) : null}
          <a
            href={`https://www.curseforge.com/hytale/mods/${mod.slug}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-violet-300"
          >
            CurseForge
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="shrink-0 space-y-2 text-sm text-zinc-500 sm:text-right">
          <p className="inline-flex items-center gap-1.5 sm:flex sm:justify-end">
            <Download className="h-4 w-4 shrink-0" />
            {formatDownloads(mod.downloadCount)} downloads
          </p>
          <p className="inline-flex items-center gap-1.5 text-zinc-400 sm:flex sm:justify-end">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400/80" />
            Latest
          </p>
        </div>
      </div>
    </article>
  );
}
