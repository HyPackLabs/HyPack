"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Heart, Package, User } from "lucide-react";
import { clerkAppearance } from "@/lib/clerk-appearance";

export function AuthButtons() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-white/10 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white hover:ring-violet-400/25"
          >
            <User className="h-4 w-4 shrink-0" />
            Sign in
          </button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <UserButton
          appearance={{
            ...clerkAppearance,
            elements: {
              ...clerkAppearance.elements,
              avatarBox: "h-9 w-9",
            },
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Link
              label="My modpacks"
              labelIcon={<Package className="h-4 w-4" />}
              href="/modpacks"
            />
            <UserButton.Link
              label="My likes"
              labelIcon={<Heart className="h-4 w-4" />}
              href="/modpacks/likes"
            />
            <UserButton.Action label="manageAccount" />
            <UserButton.Action label="signOut" />
          </UserButton.MenuItems>
        </UserButton>
      </Show>
    </>
  );
}
