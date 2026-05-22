import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ModpackListCard } from "@/components/modpacks/modpack-list-card";
import { ModpacksEmptyState } from "@/components/modpacks/modpacks-empty-state";
import { getUserModpacks } from "@/lib/modpacks/get-user-modpacks";

export const metadata = {
  title: "My modpacks — HyPack",
  description: "View and manage your Hytale modpacks.",
};

export default async function ModpacksPage() {
  const { userId } = await auth();
  const modpacks = userId ? await getUserModpacks(userId) : [];

  return (
    <div className="flex min-h-full flex-col bg-[#080808]">
      <Header />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              My modpacks
            </h1>
            <p className="mt-2 text-zinc-400">
              Build, manage, and share your Hytale mod collections.
            </p>
          </div>

          <div className="mt-10">
            {modpacks.length === 0 ? (
              <ModpacksEmptyState />
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
