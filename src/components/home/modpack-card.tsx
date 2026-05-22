import Link from "next/link";
import { Heart } from "lucide-react";
import type { FeaturedModpack } from "@/lib/home-data";

type ModpackCardProps = {
  modpack: FeaturedModpack;
};

const visibilityStyles = {
  Private: "bg-zinc-800 text-zinc-300",
  Unlisted: "bg-violet-500/15 text-violet-200",
  Public: "bg-emerald-500/15 text-emerald-200",
} as const;

export function ModpackCard({ modpack }: ModpackCardProps) {
  return (
    <Link
      href={`/modpacks/${modpack.id}`}
      className="group block rounded-2xl border border-white/5 bg-[#111111] p-6 transition hover:border-violet-500/30 hover:bg-[#141414]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white group-hover:text-violet-200">
            {modpack.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{modpack.subtitle}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${visibilityStyles[modpack.visibility]}`}
        >
          {modpack.visibility}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-zinc-300">
            {modpack.author.slice(0, 1)}
          </span>
          <span>
            {modpack.author}
            {modpack.isHypackTeam ? " team" : null}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            {modpack.likes} {modpack.likes === 1 ? "like" : "likes"}
          </span>
          <span>{modpack.updatedAt}</span>
        </div>
      </div>
    </Link>
  );
}
