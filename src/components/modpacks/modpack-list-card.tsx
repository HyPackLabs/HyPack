import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { Modpack, ModpackCreator } from '@/lib/modpacks/types';
import { ModpackCreatorLink } from '@/components/modpacks/modpack-creator-link';
import { ModpackIcon } from '@/components/modpacks/modpack-icon';
import { ModpackListCardLikeable } from '@/components/modpacks/modpack-list-card-likeable';

type ModpackListCardProps = {
	modpack: Modpack;
	layout?: 'grid' | 'list';
	creator?: ModpackCreator;
	modpackHref?: string;
	showLikeButton?: boolean;
	likedByUser?: boolean;
	isSignedIn?: boolean;
};

const visibilityStyles = {
	Private: 'bg-zinc-800 text-zinc-300',
	Unlisted: 'bg-violet-500/15 text-violet-200',
	Public: 'bg-emerald-500/15 text-emerald-200',
} as const;

export function ModpackListCard({
	modpack,
	layout = 'grid',
	creator,
	modpackHref,
	showLikeButton = false,
	likedByUser = false,
	isSignedIn = false,
}: ModpackListCardProps) {
	const href = modpackHref ?? `/modpacks/${modpack.id}`;

	if (layout === 'list') {
		if (showLikeButton) {
			return (
				<ModpackListCardLikeable
					modpack={modpack}
					creator={creator}
					modpackHref={href}
					likedByUser={likedByUser}
					isSignedIn={isSignedIn}
				/>
			);
		}

		return (
			<article className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-[#111111] p-4 transition hover:border-violet-500/30 hover:bg-[#141414] sm:gap-5 sm:p-5">
				<Link
					href={href}
					className="shrink-0 transition-opacity hover:opacity-90"
				>
					<ModpackIcon
						iconUrl={modpack.iconUrl}
						title={modpack.title}
						size="lg"
					/>
				</Link>
				<div className="min-w-0 flex-1">
					<Link href={href} className="block min-w-0">
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
							{modpack.modCount} {modpack.modCount === 1 ? 'mod' : 'mods'}
						</span>
						<span aria-hidden="true">·</span>
						<span className="inline-flex items-center gap-1">
							<Heart className="h-3.5 w-3.5" />
							{modpack.likes} {modpack.likes === 1 ? 'like' : 'likes'}
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
			</article>
		);
	}

	return (
		<Link
			href={href}
			className="group block rounded-2xl border border-white/5 bg-[#111111] p-6 transition hover:border-violet-500/30 hover:bg-[#141414]"
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<ModpackIcon
						iconUrl={modpack.iconUrl}
						title={modpack.title}
						size="sm"
					/>
					<div>
						<h2 className="text-lg font-semibold text-white group-hover:text-violet-200">
							{modpack.title}
						</h2>
						<p className="mt-1 line-clamp-2 text-sm text-zinc-400">
							{modpack.description}
						</p>
					</div>
				</div>
				<span
					className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${visibilityStyles[modpack.visibility]}`}
				>
					{modpack.visibility}
				</span>
			</div>

			<div className="mt-5 flex items-center gap-4 border-t border-white/5 pt-4 text-sm text-zinc-500">
				<span>
					{modpack.modCount} {modpack.modCount === 1 ? 'mod' : 'mods'}
				</span>
				<span aria-hidden="true">·</span>
				<span>{modpack.updatedAt}</span>
			</div>
		</Link>
	);
}
