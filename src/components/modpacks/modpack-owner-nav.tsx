'use client';

import Link from 'next/link';
import { ArrowLeft, Pencil, Settings, Trash2 } from 'lucide-react';

type ModpackOwnerNavProps = {
	modpackId: string;
	active: 'edit' | 'settings';
	onDelete?: () => void;
	isDeleting?: boolean;
};

export function ModpackOwnerNav({
	modpackId,
	active,
	onDelete,
	isDeleting = false,
}: ModpackOwnerNavProps) {
	return (
		<div className="inline-flex overflow-hidden rounded-full ring-1 ring-white/10">
			<Link
				href={`/modpacks/${modpackId}`}
				className="inline-flex items-center gap-2 border-r border-white/10 bg-[#141414] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#1a1a1a] hover:text-white"
			>
				<ArrowLeft className="h-4 w-4" />
				Back
			</Link>
			{active === 'edit' ? (
				<span className="inline-flex items-center gap-2 border-r border-violet-400/30 bg-linear-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white">
					<Pencil className="h-4 w-4" />
					Edit
				</span>
			) : (
				<Link
					href={`/modpacks/${modpackId}/edit`}
					className="inline-flex items-center gap-2 border-r border-white/10 bg-[#141414] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#1a1a1a] hover:text-white"
				>
					<Pencil className="h-4 w-4" />
					Edit
				</Link>
			)}
			{active === 'settings' ? (
				<span className="inline-flex items-center gap-2 border-r border-violet-400/30 bg-linear-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white">
					<Settings className="h-4 w-4" />
					Settings
				</span>
			) : (
				<Link
					href={`/modpacks/${modpackId}/settings`}
					className="inline-flex items-center gap-2 border-r border-white/10 bg-[#141414] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#1a1a1a] hover:text-white"
				>
					<Settings className="h-4 w-4" />
					Settings
				</Link>
			)}
			<button
				type="button"
				onClick={onDelete}
				disabled={isDeleting}
				className="inline-flex items-center gap-2 bg-red-950/70 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<Trash2 className="h-4 w-4" />
				Delete
			</button>
		</div>
	);
}
