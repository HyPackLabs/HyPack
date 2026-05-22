import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ModpackListCard } from "@/components/modpacks/modpack-list-card";
import { ModpackListPagination } from "@/components/modpacks/modpack-list-pagination";
import { getClerkUserProfile } from "@/lib/clerk/get-user-profiles";
import { getPublicModpacks } from "@/lib/modpacks/get-public-modpacks";

type UserModpacksPageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{
    page?: string;
  }>;
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

export async function generateMetadata({ params }: UserModpacksPageProps) {
  const { userId } = await params;
  const profile = await getClerkUserProfile(userId);

  return {
    title: profile
      ? `${profile.displayName}'s modpacks — HyPack`
      : "Creator modpacks — HyPack",
  };
}

export default async function UserModpacksPage({
  params,
  searchParams,
}: UserModpacksPageProps) {
  const { userId } = await params;
  const routeParams = await searchParams;
  const profile = await getClerkUserProfile(userId);

  if (!profile) {
    notFound();
  }

  const requestedPage = Number.parseInt(routeParams.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const result = await getPublicModpacks({ page, creatorId: userId });
  const safePage = result.totalPages > 0 ? Math.min(page, result.totalPages) : 1;

  const displayResult =
    safePage === page
      ? result
      : await getPublicModpacks({ page: safePage, creatorId: userId });

  return (
    <div className="flex min-h-full flex-col bg-[#080808]">
      <Header />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to explore
          </Link>

          <div className="mt-8 flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-500/15 ring-1 ring-violet-400/20">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-violet-200">
                  {getInitials(profile.displayName)}
                </span>
              )}
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {profile.displayName}
              </h1>
              <p className="mt-2 text-zinc-400">Public modpacks by this creator</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 text-sm text-zinc-500">
            <p>
              {displayResult.totalCount === 0
                ? "No public modpacks yet."
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
                  {`${profile.displayName} hasn't shared any public modpacks yet.`}
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {displayResult.modpacks.map((modpack) => (
                  <li key={modpack.id}>
                    <ModpackListCard modpack={modpack} layout="list" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {displayResult.totalPages > 1 ? (
            <div className="mt-10">
              <ModpackListPagination
                basePath={`/users/${userId}`}
                page={displayResult.page}
                totalPages={displayResult.totalPages}
              />
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
