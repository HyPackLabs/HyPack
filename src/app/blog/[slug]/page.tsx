import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChangelogMarkdown } from "@/components/changelog/changelog-markdown";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { formatBlogDate } from "@/lib/blog/format-date";
import { getBlogPost, getBlogSlugs } from "@/lib/blog/get-entries";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "Blog — HyPack" };
  }

  return {
    title: `${post.title} — HyPack`,
    description: `Blog post from ${formatBlogDate(post.date) ?? post.date}.`,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All blog posts
        </Link>

        <article className="mt-8 rounded-2xl border border-white/5 bg-white/2 p-6 sm:p-8">
          <header className="border-b border-white/5 pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {post.title}
            </h1>
            {post.date ? (
              <time
                dateTime={post.date}
                className="mt-2 block text-sm text-zinc-500"
              >
                {formatBlogDate(post.date)}
              </time>
            ) : null}
          </header>

          <div className="pt-6">
            <ChangelogMarkdown content={post.content} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
