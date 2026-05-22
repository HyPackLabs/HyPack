import Link from "next/link";
import { Coffee, Heart } from "lucide-react";
import { DiscordIcon } from "@/components/icons/discord-icon";
import { XIcon } from "@/components/icons/x-icon";

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-5 py-2.5 text-sm font-medium text-violet-200 ring-1 ring-violet-400/20 transition hover:bg-violet-500/20"
          >
            <DiscordIcon className="h-4 w-4 shrink-0" />
            Join the Discord
          </Link>
          <Link
            href="https://x.com/jonestowndev"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-300 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            <XIcon className="h-4 w-4 shrink-0" />
            Follow on X
          </Link>
          <a
            href="https://ko-fi.com/jonestown"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#ff5e5b]/15 px-5 py-2.5 text-sm font-medium text-[#ffc9c7] ring-1 ring-[#ff5e5b]/25 transition hover:bg-[#ff5e5b]/20"
          >
            <Coffee className="h-4 w-4 shrink-0" aria-hidden />
            Donate
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500">
          <Link href="/changelog" className="transition hover:text-zinc-300">
            Changelog
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="https://github.com/blushell/HyPack"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-zinc-300"
          >
            Code open-source under AGPLv3
          </Link>
          <span aria-hidden="true">·</span>
          <span>Built for Hytale modding</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            Made with
            <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" aria-hidden="true" />
            by{" "}
            <Link
              href="https://github.com/blushell"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-zinc-300"
            >
              JonesTown
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
