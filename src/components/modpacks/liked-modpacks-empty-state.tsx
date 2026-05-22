import Link from 'next/link';
import { Heart } from 'lucide-react';

export function LikedModpacksEmptyState() {
	return (
		<div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-[#111111]/50 px-6 py-16 text-center">
			<span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 ring-1 ring-red-400/20">
				<Heart className="h-7 w-7" />
			</span>
			<h2 className="mt-6 text-xl font-semibold text-white">
				No liked modpacks yet
			</h2>
			<p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
				Like modpacks you enjoy while browsing. They&apos;ll show up here for
				quick access later.
			</p>
			<Link
				href="/explore"
				className="mt-8 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-6 py-3 text-sm font-medium text-white ring-1 ring-violet-400/30 transition hover:from-violet-400 hover:to-indigo-400"
			>
				Explore modpacks
			</Link>
		</div>
	);
}
