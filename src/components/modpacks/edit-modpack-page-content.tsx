"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CurseForgeModSummary } from "@/lib/curseforge/types";
import type { ModpackDetail } from "@/lib/modpacks/types";
import type { PackDependencyState } from "@/lib/modpacks/mod-dependency-selection";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditModpackForm } from "@/components/modpacks/edit-modpack-form";
import { ModpackOwnerNav } from "@/components/modpacks/modpack-owner-nav";

type EditModpackPageContentProps = {
  modpack: ModpackDetail;
  initialMods: CurseForgeModSummary[];
  initialDependencyState?: PackDependencyState;
};

export function EditModpackPageContent({
  modpack,
  initialMods,
  initialDependencyState,
}: EditModpackPageContentProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/modpacks/${modpack.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setShowDeleteConfirm(false);
        setError("Could not delete modpack.");
        return;
      }

      setShowDeleteConfirm(false);
      router.push("/modpacks");
      router.refresh();
    } catch {
      setShowDeleteConfirm(false);
      setError("Could not delete modpack.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <ConfirmDialog
        open={showDeleteConfirm}
        title={`Delete "${modpack.title}"?`}
        description="This will permanently remove the modpack and its mod list. This action cannot be undone."
        confirmLabel="Delete modpack"
        cancelLabel="Cancel"
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!isDeleting) {
            setShowDeleteConfirm(false);
          }
        }}
      />

      <ModpackOwnerNav
        modpackId={modpack.id}
        active="edit"
        onDelete={() => setShowDeleteConfirm(true)}
        isDeleting={isDeleting}
      />

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      <div className="mt-10">
        <EditModpackForm
          modpackId={modpack.id}
          initialMods={initialMods}
          initialDependencyState={initialDependencyState}
        />
      </div>
    </>
  );
}
