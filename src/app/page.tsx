import { ExportOptions } from "@/components/home/export-options";
import { Hero } from "@/components/home/hero";
import { ModCard } from "@/components/home/mod-card";
import { ModpackCard } from "@/components/home/modpack-card";
import { StatsBar } from "@/components/home/stats-bar";
import { VisibilityCards } from "@/components/home/visibility-cards";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { featuredMods } from "@/lib/home-data";
import { getFeaturedHomeModpacks } from "@/lib/home/get-featured-modpacks";

export default async function HomePage() {
  const featuredModpacks = await getFeaturedHomeModpacks();

  return (
    <div className="min-h-full bg-[#080808] text-white">
      <Header />
      <main>
        <Hero />
        <StatsBar />

        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Mods from CurseForge
              </h2>
              <p className="mt-4 text-zinc-400">
                Browse thousands of Hytale mods and pull them into your modpack
                from one place.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {featuredMods.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                A town square for Hytale modding
              </h2>
              <p className="mt-4 text-zinc-400">
                Share curated modpacks, discover what others are running, and
                fork lists to get started faster.
              </p>
            </div>

            {featuredModpacks.length > 0 ? (
              <div className="mt-12 grid gap-5 lg:grid-cols-2">
                {featuredModpacks.map((modpack) => (
                  <ModpackCard key={modpack.id} modpack={modpack} />
                ))}
              </div>
            ) : (
              <div className="mt-12 rounded-2xl border border-dashed border-white/10 bg-[#111111]/50 px-6 py-16 text-center">
                <p className="text-sm text-zinc-500">
                  Featured modpacks will appear here once HyPack and the community
                  have packs to share.
                </p>
              </div>
            )}
          </div>
        </section>

        <VisibilityCards />
        <ExportOptions />
      </main>
      <Footer />
    </div>
  );
}
