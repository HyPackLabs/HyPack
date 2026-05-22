"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Modpack, ModpackCreator } from "@/lib/modpacks/types";
import { ModpackCreatorLink } from "@/components/modpacks/modpack-creator-link";
import { ModpackIcon } from "@/components/modpacks/modpack-icon";
import { ModpackLikeButton } from "@/components/modpacks/modpack-like-button";

type ModpackListCardLikeableProps = {
	modpack: Modpack;
	creator?: ModpackCreator;
	modpackHref: string;
	likedByUser: boolean;
	isSignedIn: boolean;
};

const visibilityStyles = {
	Private: "bg-zinc-800 text-zinc-300",
	Unlisted: "bg-violet-500/15 text-violet-200",
	Public: "bg-emerald-500/15 text-emerald-200",
} as const;

export function ModpackListCardLikeable({
	modpack,
	creator,
	modpackHref,
	likedByUser,
	isSignedIn,
}: ModpackListCardLikeableProps) {
	const [likes, setLikes] = useState(modpack.likes);
	const [liked, setLiked] = useState(likedByUser);

	return (
		<article className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-[#111111] p-4 transition hover:border-violet-500/30 hover:bg-[#141414] sm:gap-5 sm:p-5">
			<Link
				href={modpackHref}
				className="shrink-0 transition-opacity hover:opacity-90"
			>
				<ModpackIcon
					iconUrl={modpack.iconUrl}
					title={modpack.title}
					size="lg"
				/>
			</Link>
			<div className="min-w-0 flex-1">
				<Link href={modpackHref} className="block min-w-0">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
						<h2 className="truncate text-lg font-semibold text-white group-hover:text-violet-200">
							{modpack.title}
						</h2>
						<span
							className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${visibilityStyles[modpack.visibility]}`}
						>
							{modpack.visibility}
						</span>
					</div>
					{modpack.description ? (
						<p className="mt-1 line-clamp-1 text-sm text-zinc-400">
							{modpack.description}
						</p>
					) : null}
				</Link>
				<p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-zinc-500">
					<span>
						{modpack.modCount} {modpack.modCount === 1 ? "mod" : "mods"}
					</span>
					<span aria-hidden="true">·</span>
					<span className="inline-flex items-center gap-1">
						<Heart
							className={`h-3.5 w-3.5 ${
								liked ? "fill-red-400 text-red-400" : ""
							}`}
						/>
						{likes} {likes === 1 ? "like" : "likes"}
					</span>
					<span aria-hidden="true">·</span>
					<span>{modpack.updatedAt}</span>
					{creator ? (
						<>
							<span aria-hidden="true">·</span>
							<ModpackCreatorLink creator={creator} />
						</>
					) : null}
				</p>
			</div>
			<ModpackLikeButton
				modpackId={modpack.id}
				initialLikes={likes}
				initialLikedByUser={liked}
				isSignedIn={isSignedIn}
				variant="action"
				onLikeChange={({ likes: nextLikes, likedByUser: nextLiked }) => {
					setLikes(nextLikes);
					setLiked(nextLiked);
				}}
			/>
		</article>
	);
}
