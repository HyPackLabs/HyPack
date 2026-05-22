import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { FeaturedMod } from "@/lib/home-data";

type ModCardProps = {
  mod: FeaturedMod;
};

export function ModCard({ mod }: ModCardProps) {
  return (
    <article className="group flex flex-col rounded-2xl border border-white/5 bg-[#111111] p-5 transition hover:border-white/10 hover:bg-[#141414]">
      <div className="relative mb-4 h-14 w-14 overflow-hidden rounded-xl ring-1 ring-white/10">
        <Image
          src={mod.logoUrl}
          alt={`${mod.name} icon`}
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>

      <h3 className="text-lg font-semibold text-white">{mod.name}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-zinc-400">
        {mod.description}
      </p>

      <div className="mt-5 flex items-center justify-between text-xs text-zinc-500">
        <span>{mod.downloads} downloads</span>
        <span className="rounded-full bg-white/5 px-2 py-1 text-zinc-300">
          Latest
        </span>
      </div>

      <a
        href={`https://www.curseforge.com/hytale/mods/${mod.slug}`}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition group-hover:text-violet-300"
      >
        {mod.provider}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}
