import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChangelogMarkdown } from "@/components/changelog/changelog-markdown";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { formatGuideCategoryLabel } from "@/lib/guides/format-category";
import { formatGuideDate } from "@/lib/guides/format-date";
import { getGuideEntry, getGuideSlugs } from "@/lib/guides/get-entries";

type GuideEntryPageProps = {
  params: Promise<{ slug: string[] }>;
};

export function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({
    slug: slug.split("/"),
  }));
}

export async function generateMetadata({
  params,
}: GuideEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideEntry(slug.join("/"));

  if (!guide) {
    return { title: "Guides — HyPack" };
  }

  return {
    title: `${guide.title} — HyPack`,
    description: `Guide from ${formatGuideDate(guide.date) ?? guide.date}.`,
  };
}

export default async function GuideEntryPage({ params }: GuideEntryPageProps) {
  const { slug } = await params;
  const guide = getGuideEntry(slug.join("/"));

  if (!guide) {
    notFound();
  }

  const backHref = guide.category
    ? `/guides?category=${encodeURIComponent(guide.category)}`
    : "/guides";

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {guide.category
            ? `All ${formatGuideCategoryLabel(guide.category)} guides`
            : "All guides"}
        </Link>

        <article className="mt-8 rounded-2xl border border-white/5 bg-white/2 p-6 sm:p-8">
          <header className="border-b border-white/5 pb-6">
            {guide.category ? (
              <p className="text-xs font-medium uppercase tracking-wide text-violet-400/80">
                {formatGuideCategoryLabel(guide.category)}
              </p>
            ) : null}
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {guide.title}
            </h1>
            {guide.date ? (
              <time
                dateTime={guide.date}
                className="mt-2 block text-sm text-zinc-500"
              >
                {formatGuideDate(guide.date)}
              </time>
            ) : null}
          </header>

          <div className="pt-6">
            <ChangelogMarkdown content={guide.content} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
