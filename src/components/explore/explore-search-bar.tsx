import { Search } from "lucide-react";

type ExploreSearchBarProps = {
  query: string;
  action?: string;
};

export function ExploreSearchBar({
  query,
  action = "/explore",
}: ExploreSearchBarProps) {
  return (
    <form action={action} method="get" className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search public modpacks…"
        autoComplete="off"
        className="input-dark w-full rounded-xl border border-white/10 bg-[#111111] py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-400/30 focus:ring-2 focus:ring-violet-500/20"
      />
    </form>
  );
}
