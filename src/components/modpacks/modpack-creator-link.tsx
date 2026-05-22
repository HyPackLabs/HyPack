import Image from "next/image";
import Link from "next/link";
import type { ModpackCreator } from "@/lib/modpacks/types";

type ModpackCreatorLinkProps = {
  creator: ModpackCreator;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function ModpackCreatorLink({ creator }: ModpackCreatorLinkProps) {
  return (
    <Link
      href={`/users/${creator.id}`}
      className="inline-flex max-w-full items-center gap-1.5 text-zinc-500 transition hover:text-violet-200"
      title={`View ${creator.displayName}'s public modpacks`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-500/15 ring-1 ring-violet-400/20">
        {creator.avatarUrl ? (
          <Image
            src={creator.avatarUrl}
            alt=""
            width={20}
            height={20}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[9px] font-semibold text-violet-200">
            {getInitials(creator.displayName)}
          </span>
        )}
      </span>
      <span className="truncate">{creator.displayName}</span>
    </Link>
  );
}
