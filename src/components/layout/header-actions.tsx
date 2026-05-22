"use client";

import { Show } from "@clerk/nextjs";
import { CreateModpackButton } from "@/components/modpacks/create-modpack-button";
import { AuthButtons } from "@/components/auth/auth-buttons";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-8">
      <Show when="signed-in">
        <CreateModpackButton variant="nav" />
      </Show>
      <AuthButtons />
    </div>
  );
}
