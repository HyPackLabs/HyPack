import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LikedModpacksEmptyState } from "@/components/modpacks/liked-modpacks-empty-state";
import { ModpackListCard } from "@/components/modpacks/modpack-list-card";
import { getLikedModpacks } from "@/lib/modpacks/get-liked-modpacks";

export const metadata = {
  title: "My likes — HyPack",
  description: "Modpacks you have liked on HyPack.",
};

export default async function LikedModpacksPage() {
  const { userId } = await auth();
  const modpacks = userId ? await getLikedModpacks(userId) : [];

  return (
    <div className="flex min-h-full flex-col bg-[#080808]">
      <Header />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              My likes
            </h1>
            <p className="mt-2 text-zinc-400">
              Modpacks you&apos;ve liked, saved for quick access.
            </p>
          </div>

          <div className="mt-10">
            {modpacks.length === 0 ? (
              <LikedModpacksEmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {modpacks.map((modpack) => (
                  <ModpackListCard key={modpack.id} modpack={modpack} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
