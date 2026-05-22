'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	Clock,
	Copy,
	CopyPlus,
	Download,
	Globe,
	Heart,
	LayoutGrid,
	LayoutList,
	Loader2,
	Lock,
	Pencil,
	Settings,
	Shield,
	Trash2,
} from 'lucide-react';
import type { CurseForgeModSummary } from '@/lib/curseforge/types';
import type { ModpackDetail } from '@/lib/modpacks/types';
import { ModpackDetailModCard } from '@/components/modpacks/modpack-detail-mod-card';
import { ModpackIcon } from '@/components/modpacks/modpack-icon';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type ModpackDetailViewProps = {
	modpack: ModpackDetail;
	mods: CurseForgeModSummary[];
	isSignedIn: boolean;
};

const visibilityIcons = {
	Private: Lock,
	Unlisted: Shield,
	Public: Globe,
} as const;

function ToolbarGroup({
	variant = 'secondary',
	children,
}: {
	variant?: 'primary' | 'secondary';
	children: React.ReactNode;
}) {
	return (
		<div
			className={`inline-flex overflow-hidden rounded-full ${
				variant === 'primary'
					? 'bg-linear-to-r from-violet-500 to-indigo-500'
					: 'bg-[#141414] ring-1 ring-white/10'
			}`}
		>
			{children}
		</div>
	);
}

function ToolbarGroupButton({
	children,
	icon,
	onClick,
	disabled,
	title,
	iconOnly,
	danger,
	showDivider,
}: {
	children?: React.ReactNode;
	icon: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	title?: string;
	iconOnly?: boolean;
	danger?: boolean;
	showDivider?: boolean;
}) {
	return (
		<button
			type="button"
			title={title}
			onClick={onClick}
			disabled={disabled}
			className={`inline-flex items-center justify-center gap-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
				iconOnly ? 'px-3 py-2.5' : 'px-4 py-2.5'
			} ${
				danger
					? 'bg-red-950/70 text-red-300 hover:bg-red-950'
					: 'text-zinc-200 hover:bg-white/10'
			} ${showDivider ? 'border-r border-white/10' : ''}`}
		>
			{icon}
			{children ?? null}
		</button>
	);
}

function PrimaryGroupButton({
	children,
	icon,
	onClick,
	disabled,
	showDivider,
}: {
	children: React.ReactNode;
	icon: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	showDivider?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 ${
				showDivider ? 'border-r border-white/20' : ''
			}`}
		>
			{icon}
			{children}
		</button>
	);
}

export function ModpackDetailView({
	modpack,
	mods,
	isSignedIn,
}: ModpackDetailViewProps) {
	const router = useRouter();
	const [layout, setLayout] = useState<'list' | 'grid'>('list');
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDuplicating, setIsDuplicating] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [likes, setLikes] = useState(modpack.likes);
	const [likedByUser, setLikedByUser] = useState(modpack.likedByUser);
	const [isLiking, setIsLiking] = useState(false);
	const [actionMessage, setActionMessage] = useState<string | null>(null);

	const VisibilityIcon = visibilityIcons[modpack.visibility];

	function showComingSoon(label: string) {
		setActionMessage(`${label} — coming soon`);
		window.setTimeout(() => setActionMessage(null), 2500);
	}

	async function handleCopyLink() {
		const url = `${window.location.origin}/modpacks/${modpack.id}`;
		try {
			await navigator.clipboard.writeText(url);
			setActionMessage('Link copied to clipboard');
			window.setTimeout(() => setActionMessage(null), 2500);
		} catch {
			setActionMessage('Could not copy link');
			window.setTimeout(() => setActionMessage(null), 2500);
		}
	}

	async function handleLike() {
		if (!isSignedIn) {
			router.push(
				`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`
			);
			return;
		}

		setIsLiking(true);
		setActionMessage(null);

		try {
			const response = await fetch(`/api/modpacks/${modpack.id}/like`, {
				method: 'POST',
			});
			const payload = (await response.json()) as {
				likes?: number;
				likedByUser?: boolean;
				error?: string;
			};

			if (!response.ok) {
				setActionMessage(payload.error ?? 'Could not update like.');
				return;
			}

			setLikes(payload.likes ?? likes);
			setLikedByUser(Boolean(payload.likedByUser));
		} catch {
			setActionMessage('Could not update like.');
		} finally {
			setIsLiking(false);
		}
	}

	async function handleExport() {
		setIsExporting(true);
		setActionMessage(null);

		try {
			const response = await fetch(`/api/modpacks/${modpack.id}/export`);

			if (!response.ok) {
				const payload = (await response.json()) as { error?: string };
				setActionMessage(payload.error ?? 'Could not export modpack.');
				return;
			}

			const blob = await response.blob();
			const contentDisposition = response.headers.get('Content-Disposition');
			const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
			const filename = filenameMatch?.[1] ?? `${modpack.title}.zip`;
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			link.click();
			URL.revokeObjectURL(url);
			setActionMessage('Modpack exported.');
			window.setTimeout(() => setActionMessage(null), 2500);
		} catch {
			setActionMessage('Could not export modpack.');
		} finally {
			setIsExporting(false);
		}
	}

	async function handleDuplicate() {
		if (!isSignedIn) {
			router.push(
				`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`
			);
			return;
		}

		setIsDuplicating(true);
		setActionMessage(null);

		try {
			const response = await fetch(`/api/modpacks/${modpack.id}/duplicate`, {
				method: 'POST',
			});
			const payload = (await response.json()) as {
				modpackId?: string;
				error?: string;
			};

			if (!response.ok || !payload.modpackId) {
				setActionMessage(payload.error ?? 'Could not duplicate modpack');
				return;
			}

			router.push(`/modpacks/${payload.modpackId}`);
			router.refresh();
		} catch {
			setActionMessage('Could not duplicate modpack');
		} finally {
			setIsDuplicating(false);
		}
	}

	async function handleDelete() {
		setIsDeleting(true);
		setActionMessage(null);

		try {
			const response = await fetch(`/api/modpacks/${modpack.id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				setShowDeleteConfirm(false);
				setActionMessage('Could not delete modpack');
				return;
			}

			setShowDeleteConfirm(false);
			router.push('/modpacks');
			router.refresh();
		} catch {
			setShowDeleteConfirm(false);
			setActionMessage('Could not delete modpack');
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<div className="w-full">
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
			<header>
				<div className="flex items-start gap-5">
					<ModpackIcon
						iconUrl={modpack.iconUrl}
						title={modpack.title}
						size="lg"
					/>
					<div className="min-w-0 flex-1">
						<h1 className="text-4xl font-bold tracking-tight text-white sm:text-[2.75rem] sm:leading-tight">
							{modpack.title}
						</h1>

						<ul className="mt-6 flex flex-col items-start gap-2 text-sm text-zinc-400">
							<li className="inline-flex items-center gap-2">
								<Clock className="h-4 w-4 shrink-0 text-zinc-500" />
								Created on {modpack.createdAt}
							</li>
							<li className="inline-flex items-center gap-2">
								<Heart
									className={`h-4 w-4 shrink-0 ${
										likedByUser ? 'fill-red-400 text-red-400' : 'text-zinc-500'
									}`}
								/>
								{likes} {likes === 1 ? 'like' : 'likes'}
							</li>
							<li className="inline-flex items-center gap-2">
								<VisibilityIcon className="h-4 w-4 shrink-0 text-zinc-500" />
								{modpack.visibility}
							</li>
						</ul>
					</div>
				</div>
			</header>

			<div className="mt-8 flex flex-wrap items-center gap-3">
				<ToolbarGroup variant="primary">
					<PrimaryGroupButton
						icon={
							isExporting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Download className="h-4 w-4" />
							)
						}
						disabled={isExporting}
						onClick={() => void handleExport()}
						showDivider
					>
						{isExporting ? 'Exporting…' : 'Export'}
					</PrimaryGroupButton>
					<PrimaryGroupButton
						icon={<Copy className="h-4 w-4" />}
						onClick={() => void handleCopyLink()}
					>
						Copy
					</PrimaryGroupButton>
				</ToolbarGroup>

				<ToolbarGroup>
					<ToolbarGroupButton
						icon={
							isLiking ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Heart
									className={`h-4 w-4 ${likedByUser ? 'fill-red-400 text-red-400' : ''}`}
								/>
							)
						}
						disabled={isLiking}
						onClick={() => void handleLike()}
						showDivider
					>
						{likedByUser ? 'Liked' : 'Like'}
					</ToolbarGroupButton>
					<ToolbarGroupButton
						icon={
							isDuplicating ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<CopyPlus className="h-4 w-4" />
							)
						}
						disabled={isDuplicating}
						onClick={() => void handleDuplicate()}
						showDivider
					>
						Duplicate
					</ToolbarGroupButton>
					<ToolbarGroupButton
						icon={
							layout === 'list' ? (
								<LayoutGrid className="h-4 w-4" />
							) : (
								<LayoutList className="h-4 w-4" />
							)
						}
						title={layout === 'list' ? 'Switch to grid' : 'Switch to list'}
						onClick={() =>
							setLayout((current) => (current === 'list' ? 'grid' : 'list'))
						}
						iconOnly
					/>
				</ToolbarGroup>

				{modpack.isOwner ? (
					<ToolbarGroup>
						<ToolbarGroupButton
							icon={<Pencil className="h-4 w-4" />}
							onClick={() => router.push(`/modpacks/${modpack.id}/edit`)}
							showDivider
						>
							Edit
						</ToolbarGroupButton>
						<ToolbarGroupButton
							icon={<Settings className="h-4 w-4" />}
							onClick={() => router.push(`/modpacks/${modpack.id}/settings`)}
							showDivider
						>
							Settings
						</ToolbarGroupButton>
						<ToolbarGroupButton
							icon={
								isDeleting ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Trash2 className="h-4 w-4" />
								)
							}
							disabled={isDeleting}
							onClick={() => setShowDeleteConfirm(true)}
							danger
						>
							Delete
						</ToolbarGroupButton>
					</ToolbarGroup>
				) : null}
			</div>

			{actionMessage ? (
				<p className="mt-4 text-sm text-zinc-500">{actionMessage}</p>
			) : null}

			<div className="mt-10">
				{mods.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-white/10 bg-[#111111]/50 px-6 py-16 text-center">
						<p className="text-sm text-zinc-500">
							{modpack.isOwner ? (
								<>
									No mods in this pack yet.{' '}
									<Link
										href="/modpacks/new"
										className="text-violet-300 transition hover:text-violet-200"
									>
										Add mods
									</Link>{' '}
									to get started.
								</>
							) : (
								'No mods in this pack yet.'
							)}
						</p>
					</div>
				) : (
					<ul
						className={
							layout === 'grid'
								? 'grid gap-3 sm:grid-cols-2'
								: 'flex flex-col gap-3'
						}
					>
						{mods.map((mod) => (
							<li key={mod.id}>
								<ModpackDetailModCard mod={mod} layout={layout} />
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
