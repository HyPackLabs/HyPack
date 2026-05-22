import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ModpackDetailView } from "@/components/modpacks/modpack-detail-view";
import { getModsByIds } from "@/lib/curseforge/get-mods-by-ids";
import { isCurseForgeConfigured } from "@/lib/curseforge/client";
import { getModpackDetailForViewer } from "@/lib/modpacks/get-modpack-detail";
import { getModpackDetailBackLink } from "@/lib/modpacks/modpack-detail-navigation";

type ModpackDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    from?: string;
    q?: string;
    page?: string;
  }>;
};

export async function generateMetadata({ params }: ModpackDetailPageProps) {
  const { id } = await params;
  const { userId } = await auth();
  const modpack = await getModpackDetailForViewer(userId, id);

  return {
    title: modpack ? `${modpack.title} — HyPack` : "Modpack — HyPack",
  };
}

export default async function ModpackDetailPage({
  params,
  searchParams,
}: ModpackDetailPageProps) {
  const { id } = await params;
  const routeParams = await searchParams;
  const { userId } = await auth();
  const modpack = await getModpackDetailForViewer(userId, id);

  if (!modpack) {
    notFound();
  }

  const backLink = getModpackDetailBackLink(routeParams, modpack.isOwner);

  let mods: Awaited<ReturnType<typeof getModsByIds>> = [];
  if (isCurseForgeConfigured() && modpack.modIds.length > 0) {
    try {
      const fetched = await getModsByIds(modpack.modIds);
      const byId = new Map(fetched.map((mod) => [mod.id, mod]));
      mods = modpack.modIds
        .map((modId) => byId.get(modId))
        .filter((mod): mod is NonNullable<typeof mod> => mod !== undefined);
    } catch (error) {
      console.error("Failed to load mod details:", error);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-[#080808]">
      <Header />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLink.label}
          </Link>

          <div className="mt-8">
            <ModpackDetailView
              modpack={modpack}
              mods={mods}
              isSignedIn={Boolean(userId)}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
