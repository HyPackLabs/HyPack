import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getGuideCategories } from "@/lib/guides/get-entries";

export function GuidesNav() {
  const categories = getGuideCategories();

  if (categories.length === 0) {
    return (
      <Link
        href="/guides"
        className="transition-colors hover:text-white"
      >
        Guides
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1 transition-colors group-hover:text-white"
      >
        Guides
        <ChevronDown
          className="h-3.5 w-3.5 transition group-hover:rotate-180"
          aria-hidden
        />
      </Link>

      <div className="pointer-events-none invisible absolute top-full left-1/2 z-50 w-52 -translate-x-1/2 pt-3 opacity-0 transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-xl border border-white/10 bg-[#121212] py-2 shadow-xl ring-1 ring-black/40">
          <Link
            href="/guides"
            className="block px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            All guides
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/guides?category=${encodeURIComponent(category.slug)}`}
              className="block px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
