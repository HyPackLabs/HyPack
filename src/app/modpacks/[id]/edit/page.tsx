import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Clock, Globe, Heart, Lock, Shield } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { EditModpackPageContent } from "@/components/modpacks/edit-modpack-page-content";
import { getModsByIds } from "@/lib/curseforge/get-mods-by-ids";
import { isCurseForgeConfigured } from "@/lib/curseforge/client";
import { getModpackDetail } from "@/lib/modpacks/get-modpack-detail";
import type { ModpackVisibility } from "@/lib/modpacks/types";

type ModpackEditPageProps = {
  params: Promise<{ id: string }>;
};

const visibilityIcons = {
  Private: Lock,
  Unlisted: Shield,
  Public: Globe,
} as const;

export async function generateMetadata({ params }: ModpackEditPageProps) {
  const { id } = await params;
  const { userId } = await auth();
  const modpack = userId ? await getModpackDetail(userId, id) : null;

  return {
    title: modpack
      ? `Edit — ${modpack.title} — HyPack`
      : "Edit modpack — HyPack",
  };
}

export default async function ModpackEditPage({ params }: ModpackEditPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const modpack = await getModpackDetail(userId, id);
  if (!modpack) {
    notFound();
  }

  let initialMods: Awaited<ReturnType<typeof getModsByIds>> = [];
  if (isCurseForgeConfigured() && modpack.modIds.length > 0) {
    try {
      const fetched = await getModsByIds(modpack.modIds);
      const byId = new Map(fetched.map((mod) => [mod.id, mod]));
      initialMods = modpack.modIds
        .map((modId) => byId.get(modId))
        .filter((mod): mod is NonNullable<typeof mod> => mod !== undefined);
    } catch (error) {
      console.error("Failed to load mod details:", error);
    }
  }

  const VisibilityIcon = visibilityIcons[modpack.visibility as ModpackVisibility];

  return (
    <div className="flex min-h-full flex-col bg-[#080808]">
      <Header />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <header>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-[2.75rem] sm:leading-tight">
              {modpack.title}
            </h1>

            <ul className="mt-6 flex flex-col items-start gap-2 text-sm text-zinc-400">
              <li className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-zinc-500" />
                Created on {modpack.createdAt}
              </li>
              <li className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4 shrink-0 text-zinc-500" />
                {modpack.likes} {modpack.likes === 1 ? "like" : "likes"}
              </li>
              <li className="inline-flex items-center gap-2">
                <VisibilityIcon className="h-4 w-4 shrink-0 text-zinc-500" />
                {modpack.visibility}
              </li>
            </ul>
          </header>

          <div className="mt-8">
            <EditModpackPageContent modpack={modpack} initialMods={initialMods} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
