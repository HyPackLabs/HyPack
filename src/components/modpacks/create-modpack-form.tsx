"use client";

import { useRouter } from "next/navigation";
import { ModpackModsForm } from "@/components/modpacks/modpack-mods-form";
import { applyModpackIconChanges } from "@/components/modpacks/modpack-icon-picker";

export function CreateModpackForm() {
  const router = useRouter();

  return (
    <ModpackModsForm
      showIconPicker
      submitLabel="Save modpack"
      footerHint="You can add or change mods later."
      onSave={async ({ title, modIds, iconSelection, dependencyState }) => {
        const response = await fetch("/api/modpacks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, modIds, dependencyState }),
        });

        const payload = (await response.json()) as {
          modpackId?: string;
          error?: string;
        };

        if (!response.ok || !payload.modpackId) {
          return { ok: false, error: payload.error ?? "Could not save modpack." };
        }

        if (iconSelection.iconFile) {
          const iconResult = await applyModpackIconChanges(
            payload.modpackId,
            iconSelection,
          );
          if (!iconResult.ok) {
            return iconResult;
          }
        }

        router.push(`/modpacks/${payload.modpackId}/edit`);
        return { ok: true };
      }}
    />
  );
}
