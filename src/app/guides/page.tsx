import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { formatGuideCategoryLabel } from "@/lib/guides/format-category";
import { formatGuideDate } from "@/lib/guides/format-date";
import { getGuideCategories, getGuideEntries } from "@/lib/guides/get-entries";

export const metadata: Metadata = {
  title: "Guides — HyPack",
  description: "Step-by-step guides for building and sharing Hytale modpacks.",
};

type GuidesPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const { category } = await searchParams;
  const categories = getGuideCategories();
  const entries = getGuideEntries(category);
  const activeCategory = category
    ? categories.find((item) => item.slug === category)
    : null;

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {activeCategory ? activeCategory.label : "Guides"}
          </h1>
          <p className="mt-3 text-zinc-400">
            {activeCategory
              ? `Guides in ${activeCategory.label.toLowerCase()}.`
              : "Step-by-step guides for building and sharing Hytale modpacks."}
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/guides"
              className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition ${
                !category
                  ? "bg-violet-500/15 text-violet-200 ring-violet-400/20"
                  : "bg-white/5 text-zinc-400 ring-white/10 hover:bg-white/10 hover:text-zinc-200"
              }`}
            >
              All
            </Link>
            {categories.map((item) => (
              <Link
                key={item.slug}
                href={`/guides?category=${encodeURIComponent(item.slug)}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition ${
                  category === item.slug
                    ? "bg-violet-500/15 text-violet-200 ring-violet-400/20"
                    : "bg-white/5 text-zinc-400 ring-white/10 hover:bg-white/10 hover:text-zinc-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        {entries.length === 0 ? (
          <p className="rounded-2xl border border-white/5 bg-white/2 px-6 py-8 text-center text-sm text-zinc-500">
            {category ? (
              <>
                No guides in{" "}
                <strong className="text-zinc-400">
                  {formatGuideCategoryLabel(category)}
                </strong>{" "}
                yet. Add a <code>.md</code> file to{" "}
                <code>content/guides/{category}/</code>.
              </>
            ) : (
              <>
                No guides yet. Add a <code>.md</code> file to{" "}
                <code>content/guides/</code> or create a subfolder for a
                category.
              </>
            )}
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {entries.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/guides/${entry.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/2 px-6 py-5 transition hover:border-violet-400/20 hover:bg-white/5 sm:px-8"
                >
                  <div className="min-w-0 flex flex-col gap-1">
                    {entry.category && !category ? (
                      <span className="text-xs font-medium uppercase tracking-wide text-violet-400/80">
                        {formatGuideCategoryLabel(entry.category)}
                      </span>
                    ) : null}
                    <h2 className="font-semibold text-white transition group-hover:text-violet-200">
                      {entry.title}
                    </h2>
                    {entry.date ? (
                      <time
                        dateTime={entry.date}
                        className="text-sm text-zinc-400"
                      >
                        {formatGuideDate(entry.date)}
                      </time>
                    ) : null}
                  </div>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-zinc-600 transition group-hover:text-violet-400"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}
