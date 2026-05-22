'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	Clock,
	Globe,
	Heart,
	Link2,
	Loader2,
	Lock,
	Save,
	Shield,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ModpackOwnerNav } from '@/components/modpacks/modpack-owner-nav';
import {
	ModpackIconPicker,
	applyModpackIconChanges,
} from '@/components/modpacks/modpack-icon-picker';
import { modpackVisibilityOptions } from '@/lib/modpacks/visibility-options';
import type { ModpackDetail, ModpackVisibility } from '@/lib/modpacks/types';

type ModpackSettingsFormProps = {
	modpack: ModpackDetail;
};

const visibilityIcons = {
	Private: Lock,
	Unlisted: Shield,
	Public: Globe,
} as const;

const optionIcons = {
	lock: Lock,
	link: Link2,
	globe: Globe,
} as const;

export function ModpackSettingsForm({ modpack }: ModpackSettingsFormProps) {
	const router = useRouter();
	const [title, setTitle] = useState(modpack.title);
	const [description, setDescription] = useState(modpack.description);
	const [visibility, setVisibility] = useState<ModpackVisibility>(
		modpack.visibility
	);
	const [iconSelection, setIconSelection] = useState({
		iconFile: null as File | null,
		removeIcon: false,
	});
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const VisibilityIcon = visibilityIcons[modpack.visibility];

	async function handleSave() {
		setError(null);
		setMessage(null);

		const trimmedTitle = title.trim();
		if (!trimmedTitle) {
			setError('Modpack title is required.');
			return;
		}

		setIsSaving(true);
		try {
			const response = await fetch(`/api/modpacks/${modpack.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: trimmedTitle,
					description,
					visibility,
				}),
			});

			const payload = (await response.json()) as { error?: string };

			if (!response.ok) {
				setError(payload.error ?? 'Could not save settings.');
				return;
			}

			const iconResult = await applyModpackIconChanges(
				modpack.id,
				iconSelection
			);
			if (!iconResult.ok) {
				setError(iconResult.error);
				return;
			}

			setMessage('Settings saved.');
			router.refresh();
		} catch {
			setError('Could not save settings.');
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete() {
		setIsDeleting(true);
		setError(null);

		try {
			const response = await fetch(`/api/modpacks/${modpack.id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				setShowDeleteConfirm(false);
				setError('Could not delete modpack.');
				return;
			}

			setShowDeleteConfirm(false);
			router.push('/modpacks');
			router.refresh();
		} catch {
			setShowDeleteConfirm(false);
			setError('Could not delete modpack.');
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
				<h1 className="text-4xl font-bold tracking-tight text-white sm:text-[2.75rem] sm:leading-tight">
					{modpack.title}
				</h1>

				<ul className="mt-6 flex flex-col items-start gap-2 text-sm text-zinc-400">
					<li className="inline-flex items-center gap-2">
						<Clock className="h-4 w-4 shrink-0 text-zinc-500" />
						Created on {modpack.createdAt}
					</li>
					<li className="inline-flex items-center gap-2">
						<Heart className="h-4 w-4 shrink-0 text-zinc-500" />
						{modpack.likes} {modpack.likes === 1 ? 'like' : 'likes'}
					</li>
					<li className="inline-flex items-center gap-2">
						<VisibilityIcon className="h-4 w-4 shrink-0 text-zinc-500" />
						{modpack.visibility}
					</li>
				</ul>
			</header>

			<div className="mt-8">
				<ModpackOwnerNav
					modpackId={modpack.id}
					active="settings"
					onDelete={() => setShowDeleteConfirm(true)}
					isDeleting={isDeleting}
				/>
			</div>

			<div className="mt-10 space-y-8">
				<ModpackIconPicker
					initialIconUrl={modpack.iconUrl}
					onChange={setIconSelection}
				/>

				<section className="space-y-3">
					<label
						htmlFor="modpack-settings-title"
						className="block text-sm font-medium text-zinc-300"
					>
						Title
					</label>
					<input
						id="modpack-settings-title"
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						maxLength={120}
						autoComplete="off"
						className="input-dark w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-violet-400/30 focus:ring-2 focus:ring-violet-500/20"
					/>
				</section>

				<section className="space-y-3">
					<label
						htmlFor="modpack-settings-description"
						className="block text-sm font-medium text-zinc-300"
					>
						Description
					</label>
					<textarea
						id="modpack-settings-description"
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						rows={6}
						className="input-dark w-full resize-y rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm leading-relaxed text-white outline-none transition focus:border-violet-400/30 focus:ring-2 focus:ring-violet-500/20"
					/>
					<p className="text-sm text-zinc-500">
						You can use a restricted subset of Markdown here.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-sm font-medium text-zinc-300">Visibility</h2>
					<div className="grid gap-3 sm:grid-cols-3">
						{modpackVisibilityOptions.map((option) => {
							const Icon = optionIcons[option.icon];
							const isSelected = visibility === option.value;

							return (
								<button
									key={option.value}
									type="button"
									onClick={() => setVisibility(option.value)}
									className={`rounded-xl border p-5 text-left transition ${
										isSelected
											? 'border-violet-400/40 bg-violet-500/10 ring-2 ring-violet-400/25'
											: 'border-white/5 bg-[#111111] hover:border-white/10 hover:bg-[#141414]'
									}`}
								>
									<span
										className={`mb-4 inline-flex rounded-lg p-2 ring-1 ring-inset ${
											isSelected
												? 'bg-violet-500/20 text-violet-200 ring-violet-400/30'
												: 'bg-white/5 text-zinc-500 ring-transparent'
										}`}
									>
										<Icon className="h-5 w-5" />
									</span>
									<h3
										className={`font-semibold ${
											isSelected ? 'text-white' : 'text-zinc-300'
										}`}
									>
										{option.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-zinc-500">
										{option.description}
									</p>
								</button>
							);
						})}
					</div>
				</section>

				{error ? <p className="text-sm text-red-400">{error}</p> : null}
				{message ? <p className="text-sm text-emerald-400">{message}</p> : null}

				<button
					type="button"
					onClick={() => void handleSave()}
					disabled={isSaving || !title.trim()}
					className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-violet-400/30 transition hover:from-violet-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isSaving ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Saving…
						</>
					) : (
						<>
							<Save className="h-4 w-4" />
							Save
						</>
					)}
				</button>
			</div>
		</div>
	);
}
