"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

type ModpackLikeButtonProps = {
  modpackId: string;
  initialLikes: number;
  initialLikedByUser: boolean;
  isSignedIn: boolean;
  variant?: "inline" | "action";
  onLikeChange?: (state: { likes: number; likedByUser: boolean }) => void;
};

export function ModpackLikeButton({
  modpackId,
  initialLikes,
  initialLikedByUser,
  isSignedIn,
  variant = "inline",
  onLikeChange,
}: ModpackLikeButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [likes, setLikes] = useState(initialLikes);
  const [likedByUser, setLikedByUser] = useState(initialLikedByUser);
  const [isLiking, setIsLiking] = useState(false);

  async function handleLike() {
    if (!isSignedIn) {
      const query = searchParams.toString();
      const redirectUrl = query ? `${pathname}?${query}` : pathname;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    setIsLiking(true);

    try {
      const response = await fetch(`/api/modpacks/${modpackId}/like`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        likes?: number;
        likedByUser?: boolean;
        error?: string;
      };

      if (!response.ok) {
        return;
      }

      setLikes(payload.likes ?? likes);
      setLikedByUser(Boolean(payload.likedByUser));
      onLikeChange?.({
        likes: payload.likes ?? likes,
        likedByUser: Boolean(payload.likedByUser),
      });
    } catch {
      // Keep current state on failure.
    } finally {
      setIsLiking(false);
    }
  }

  if (variant === "action") {
    return (
      <button
        type="button"
        onClick={() => void handleLike()}
        disabled={isLiking}
        aria-pressed={likedByUser}
        aria-label={likedByUser ? "Unlike modpack" : "Like modpack"}
        title={likedByUser ? "Unlike" : "Like"}
        className="shrink-0 rounded-lg p-2 text-zinc-500 transition hover:text-red-400 disabled:opacity-50"
      >
        {isLiking ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Heart
            className={`h-6 w-6 ${
              likedByUser ? "fill-red-400 text-red-400" : ""
            }`}
          />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleLike()}
      disabled={isLiking}
      aria-pressed={likedByUser}
      aria-label={likedByUser ? "Unlike modpack" : "Like modpack"}
      className="inline-flex items-center gap-1 transition hover:text-violet-200 disabled:opacity-50"
    >
      {isLiking ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Heart
          className={`h-3.5 w-3.5 ${
            likedByUser ? "fill-red-400 text-red-400" : ""
          }`}
        />
      )}
      {likes} {likes === 1 ? "like" : "likes"}
    </button>
  );
}
