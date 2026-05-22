import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CreateModpackForm } from "@/components/modpacks/create-modpack-form";

export const metadata = {
  title: "Create modpack — HyPack",
  description: "Create a new Hytale modpack.",
};

export default function NewModpackPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#080808]">
      <Header />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/modpacks"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to modpacks
          </Link>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
            Create a modpack
          </h1>
          <p className="mt-2 text-zinc-400">
            Name your pack, search CurseForge for Hytale mods, and build your
            mod list.
          </p>

          <div className="mt-10">
            <CreateModpackForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
