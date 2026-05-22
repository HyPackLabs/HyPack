import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ExploreSearchBar } from "@/components/explore/explore-search-bar";
import { ModpackListCard } from "@/components/modpacks/modpack-list-card";
import { ModpackListPagination } from "@/components/modpacks/modpack-list-pagination";
import { getPublicModpacks } from "@/lib/modpacks/get-public-modpacks";
import { buildModpackDetailHref } from "@/lib/modpacks/modpack-detail-navigation";

export const metadata = {
  title: "Explore modpacks — HyPack",
  description: "Browse and search public Hytale modpacks on HyPack.",
};

type ExplorePageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const { userId } = await auth();
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const result = await getPublicModpacks({ query, page, viewerUserId: userId });
  const safePage = result.totalPages > 0 ? Math.min(page, result.totalPages) : 1;

  const displayResult =
    safePage === page
      ? result
      : await getPublicModpacks({ query, page: safePage, viewerUserId: userId });

  return (
    <div className="flex min-h-full flex-col bg-[#080808]">
      <Header />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Explore modpacks
            </h1>
            <p className="mt-2 text-zinc-400">
              Browse public modpacks shared by the HyPack community.
            </p>
          </div>

          <div className="mt-8">
            <ExploreSearchBar query={query} />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 text-sm text-zinc-500">
            <p>
              {displayResult.totalCount === 0
                ? query
                  ? "No modpacks match your search."
                  : "No public modpacks yet."
                : `${displayResult.totalCount} public modpack${displayResult.totalCount === 1 ? "" : "s"}`}
            </p>
            {displayResult.totalPages > 0 ? (
              <p>
                Page {displayResult.page} of {displayResult.totalPages}
              </p>
            ) : null}
          </div>

          <div className="mt-8">
            {displayResult.modpacks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#111111]/50 px-6 py-16 text-center">
                <p className="text-sm text-zinc-500">
                  {query
                    ? "Try a different search term or clear the search to see all public modpacks."
                    : "Public modpacks will appear here once creators share them."}
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {displayResult.modpacks.map((modpack) => (
                  <li key={modpack.id}>
                    <ModpackListCard
                      modpack={modpack}
                      creator={modpack.creator}
                      modpackHref={buildModpackDetailHref(modpack.id, {
                        from: "explore",
                        query,
                        page: displayResult.page,
                      })}
                      layout="list"
                      showLikeButton
                      likedByUser={modpack.likedByUser}
                      isSignedIn={Boolean(userId)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {displayResult.totalPages > 1 ? (
            <div className="mt-10">
              <ModpackListPagination
                basePath="/explore"
                page={displayResult.page}
                totalPages={displayResult.totalPages}
                query={query}
              />
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
