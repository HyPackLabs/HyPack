import { PackageOpen } from "lucide-react";
import { CreateModpackButton } from "@/components/modpacks/create-modpack-button";

export function ModpacksEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-[#111111]/50 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/20">
        <PackageOpen className="h-7 w-7" />
      </span>
      <h2 className="mt-6 text-xl font-semibold text-white">No modpacks yet</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
        Create your first Hytale modpack, add mods from CurseForge, and share a
        link or download a ZIP when you&apos;re ready.
      </p>
      <div className="mt-8">
        <CreateModpackButton variant="lg" />
      </div>
    </div>
  );
}
