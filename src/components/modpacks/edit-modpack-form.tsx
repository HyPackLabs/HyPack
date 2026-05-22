"use client";

import { useRouter } from "next/navigation";
import type { CurseForgeModSummary } from "@/lib/curseforge/types";
import { ModpackModsForm } from "@/components/modpacks/modpack-mods-form";

type EditModpackFormProps = {
  modpackId: string;
  initialMods: CurseForgeModSummary[];
};

export function EditModpackForm({
  modpackId,
  initialMods,
}: EditModpackFormProps) {
  const router = useRouter();

  return (
    <ModpackModsForm
      showTitleField={false}
      initialSelectedMods={initialMods}
      submitLabel="Save changes"
      footerHint="Changes apply to the mod list only. Edit the title in settings."
      onSave={async ({ modIds, iconSelection }) => {
        void iconSelection;
        const response = await fetch(`/api/modpacks/${modpackId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modIds }),
        });

        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          return { ok: false, error: payload.error ?? "Could not save modpack." };
        }

        router.push(`/modpacks/${modpackId}`);
        router.refresh();
        return { ok: true };
      }}
    />
  );
}
