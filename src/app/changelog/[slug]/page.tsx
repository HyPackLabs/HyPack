import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChangelogMarkdown } from "@/components/changelog/changelog-markdown";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { formatChangelogDate } from "@/lib/changelog/format-date";
import {
  getChangelogEntry,
  getChangelogSlugs,
} from "@/lib/changelog/get-entries";

type ChangelogEntryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getChangelogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ChangelogEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getChangelogEntry(slug);

  if (!entry) {
    return { title: "Changelog — HyPack" };
  }

  return {
    title: `${entry.title} — HyPack`,
    description: `Changelog for ${formatChangelogDate(entry.date) ?? entry.date}.`,
  };
}

export default async function ChangelogEntryPage({
  params,
}: ChangelogEntryPageProps) {
  const { slug } = await params;
  const entry = getChangelogEntry(slug);

  if (!entry) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/changelog"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All changelog entries
        </Link>

        <article className="mt-8 rounded-2xl border border-white/5 bg-white/2 p-6 sm:p-8">
          <header className="border-b border-white/5 pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {entry.title}
            </h1>
            {entry.date ? (
              <time
                dateTime={entry.date}
                className="mt-2 block text-sm text-zinc-500"
              >
                {formatChangelogDate(entry.date)}
              </time>
            ) : null}
          </header>

          <div className="pt-6">
            <ChangelogMarkdown content={entry.content} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
