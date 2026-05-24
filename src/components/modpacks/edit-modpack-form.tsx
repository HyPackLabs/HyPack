"use client";

import type { CurseForgeModSummary } from "@/lib/curseforge/types";
import type { PackDependencyState } from "@/lib/modpacks/mod-dependency-selection";
import { ModpackModsForm } from "@/components/modpacks/modpack-mods-form";

type EditModpackFormProps = {
  modpackId: string;
  initialMods: CurseForgeModSummary[];
  initialDependencyState?: PackDependencyState;
};

export function EditModpackForm({
  modpackId,
  initialMods,
  initialDependencyState,
}: EditModpackFormProps) {
  return (
    <ModpackModsForm
      showTitleField={false}
      initialSelectedMods={initialMods}
      initialDependencyState={initialDependencyState}
      submitLabel="Save changes"
      saveSuccessMessage="Changes saved."
      footerHint="Changes apply to the mod list only. Edit the title in settings."
      onSave={async ({ modIds, iconSelection, dependencyState }) => {
        void iconSelection;
        const response = await fetch(`/api/modpacks/${modpackId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modIds, dependencyState }),
        });

        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          return { ok: false, error: payload.error ?? "Could not save modpack." };
        }

        return { ok: true };
      }}
    />
  );
}
