import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { formatBlogDate } from "@/lib/blog/format-date";
import { getBlogPosts } from "@/lib/blog/get-entries";

export const metadata: Metadata = {
  title: "Blog — HyPack",
  description: "News, guides, and updates from the HyPack team.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white">Blog</h1>
          <p className="mt-3 text-zinc-400">
            News, guides, and updates from the HyPack team.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="rounded-2xl border border-white/5 bg-white/2 px-6 py-8 text-center text-sm text-zinc-500">
            No blog posts yet. Add a <code>.md</code> file to{" "}
            <code>content/blog/</code> to get started.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/2 px-6 py-5 transition hover:border-violet-400/20 hover:bg-white/5 sm:px-8"
                >
                  <div className="min-w-0 flex flex-col gap-1">
                    <h2 className="font-semibold text-white transition group-hover:text-violet-200">
                      {post.title}
                    </h2>
                    {post.date ? (
                      <time
                        dateTime={post.date}
                        className="text-sm text-zinc-400"
                      >
                        {formatBlogDate(post.date)}
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
