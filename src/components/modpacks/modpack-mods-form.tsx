'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Package, Search } from 'lucide-react';
import type { CurseForgeModSummary } from '@/lib/curseforge/types';
import type { ResolvedRequiredDependencies } from '@/lib/curseforge/resolve-required-dependencies';
import { ModSearchResultRow } from '@/components/modpacks/mod-search-result-row';
import { ModpackIconPicker } from '@/components/modpacks/modpack-icon-picker';
import { SelectedModRow } from '@/components/modpacks/selected-mod-row';
import {
	applyDependencyResolution,
	collectCascadeRemovals,
	getRequiredForNames,
	mergeDirectRequiredDepsMaps,
	mergeRequiredByMaps,
	pruneDependencyMaps,
} from '@/lib/modpacks/mod-dependency-selection';

const SEARCH_DEBOUNCE_MS = 350;
const MIN_SEARCH_LENGTH = 2;

type IconSelection = {
	iconFile: File | null;
	removeIcon: boolean;
};

type ModpackModsFormProps = {
	initialTitle?: string;
	initialSelectedMods?: CurseForgeModSummary[];
	showTitleField?: boolean;
	showIconPicker?: boolean;
	submitLabel: string;
	savingLabel?: string;
	footerHint?: string;
	onSave: (input: {
		title?: string;
		modIds: number[];
		iconSelection: IconSelection;
	}) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function ModpackModsForm({
	initialTitle = '',
	initialSelectedMods = [],
	showTitleField = true,
	showIconPicker = false,
	submitLabel,
	savingLabel = 'Saving…',
	footerHint,
	onSave,
}: ModpackModsFormProps) {
	const [title, setTitle] = useState(initialTitle);
	const [iconSelection, setIconSelection] = useState<IconSelection>({
		iconFile: null,
		removeIcon: false,
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [searchResults, setSearchResults] = useState<CurseForgeModSummary[]>(
		[]
	);
	const [selectedMods, setSelectedMods] =
		useState<CurseForgeModSummary[]>(initialSelectedMods);
	const [userAddedModIds, setUserAddedModIds] = useState<number[]>(() =>
		initialSelectedMods.map((mod) => mod.id)
	);
	const [requiredBy, setRequiredBy] = useState<Record<number, number[]>>({});
	const [directRequiredDeps, setDirectRequiredDeps] = useState<
		Record<number, number[]>
	>({});
	const [addingModId, setAddingModId] = useState<number | null>(null);
	const [addError, setAddError] = useState<string | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const addedModIds = useMemo(
		() => new Set(selectedMods.map((mod) => mod.id)),
		[selectedMods]
	);

	const modNameById = useMemo(
		() => new Map(selectedMods.map((mod) => [mod.id, mod.name])),
		[selectedMods]
	);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedQuery(searchQuery.trim());
		}, SEARCH_DEBOUNCE_MS);
		return () => window.clearTimeout(timer);
	}, [searchQuery]);

	useEffect(() => {
		if (debouncedQuery.length < MIN_SEARCH_LENGTH) {
			setSearchResults([]);
			setSearchError(null);
			setIsSearching(false);
			return;
		}

		let cancelled = false;

		async function runSearch() {
			setIsSearching(true);
			setSearchError(null);

			try {
				const params = new URLSearchParams({ q: debouncedQuery });
				const response = await fetch(`/api/mods/search?${params}`);
				const payload = (await response.json()) as {
					data?: CurseForgeModSummary[];
					error?: string;
				};

				if (cancelled) return;

				if (!response.ok) {
					setSearchResults([]);
					setSearchError(payload.error ?? 'Search failed.');
					return;
				}

				setSearchResults(payload.data ?? []);
			} catch {
				if (cancelled) return;
				setSearchResults([]);
				setSearchError('Search failed. Try again.');
			} finally {
				if (!cancelled) {
					setIsSearching(false);
				}
			}
		}

		runSearch();
		return () => {
			cancelled = true;
		};
	}, [debouncedQuery]);

	const addMod = useCallback(async (mod: CurseForgeModSummary) => {
		if (addingModId !== null || addedModIds.has(mod.id)) {
			return;
		}

		setAddError(null);
		setAddingModId(mod.id);

		try {
			const response = await fetch(`/api/mods/${mod.id}/dependencies`);
			const payload = (await response.json()) as
				| ResolvedRequiredDependencies
				| { error?: string };

			if (!response.ok) {
				setAddError(
					'error' in payload && payload.error
						? payload.error
						: 'Could not resolve mod dependencies.'
				);
				return;
			}

			const resolution = payload as ResolvedRequiredDependencies;

			setUserAddedModIds((current) =>
				current.includes(mod.id) ? current : [...current, mod.id]
			);
			setRequiredBy((current) =>
				mergeRequiredByMaps(current, resolution.requiredBy)
			);
			setDirectRequiredDeps((current) =>
				mergeDirectRequiredDepsMaps(current, resolution.directRequiredDeps)
			);
			setSelectedMods((current) =>
				applyDependencyResolution(current, mod, resolution)
			);
		} catch {
			setAddError('Could not add mod. Try again.');
		} finally {
			setAddingModId(null);
		}
	}, [addingModId, addedModIds]);

	const removeMod = useCallback((modId: number) => {
		setAddError(null);

		const userAddedSet = new Set(userAddedModIds);
		const removedModIds = collectCascadeRemovals(
			modId,
			userAddedSet,
			requiredBy,
			directRequiredDeps
		);
		const pruned = pruneDependencyMaps(
			requiredBy,
			directRequiredDeps,
			removedModIds
		);

		setUserAddedModIds((current) =>
			current.filter((id) => !removedModIds.has(id))
		);
		setRequiredBy(pruned.requiredBy);
		setDirectRequiredDeps(pruned.directRequiredDeps);
		setSelectedMods((current) =>
			current.filter((mod) => !removedModIds.has(mod.id))
		);
	}, [directRequiredDeps, requiredBy, userAddedModIds]);

	async function handleSave() {
		setSaveError(null);

		const trimmedTitle = title.trim();
		if (showTitleField && !trimmedTitle) {
			setSaveError('Enter a modpack title.');
			return;
		}

		setIsSaving(true);

		try {
			const result = await onSave({
				...(showTitleField ? { title: trimmedTitle } : {}),
				modIds: selectedMods.map((mod) => mod.id),
				iconSelection,
			});

			if (!result.ok) {
				setSaveError(result.error);
			}
		} catch {
			setSaveError('Could not save modpack. Try again.');
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="space-y-10">
			{showTitleField ? (
				<section className="space-y-3">
					<label
						htmlFor="modpack-title"
						className="block text-sm font-medium text-zinc-300"
					>
						Modpack title
					</label>
					<input
						id="modpack-title"
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="e.g. Adventure Essentials"
						maxLength={120}
						autoComplete="off"
						className="input-dark w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-white placeholder:text-zinc-600 outline-none ring-violet-500/0 transition focus:border-violet-400/30 focus:ring-2 focus:ring-violet-500/20"
					/>
				</section>
			) : null}

			{showIconPicker ? (
				<ModpackIconPicker onChange={setIconSelection} />
			) : null}

			<section className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold text-white">Search mods</h2>
					<p className="mt-1 text-sm text-zinc-500">
						Find Hytale mods on CurseForge and add them to your pack.
					</p>
				</div>

				<div className="relative">
					<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
					<input
						type="search"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Search by mod name or author…"
						autoComplete="off"
						className="input-dark w-full rounded-xl border border-white/10 bg-[#111111] py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-400/30 focus:ring-2 focus:ring-violet-500/20"
					/>
				</div>

				{debouncedQuery.length > 0 &&
				debouncedQuery.length < MIN_SEARCH_LENGTH ? (
					<p className="text-sm text-zinc-500">
						Type at least {MIN_SEARCH_LENGTH} characters to search.
					</p>
				) : null}

				{isSearching ? (
					<div className="flex items-center gap-2 text-sm text-zinc-500">
						<Loader2 className="h-4 w-4 animate-spin" />
						Searching CurseForge…
					</div>
				) : null}

				{searchError ? (
					<p className="text-sm text-red-400">{searchError}</p>
				) : null}

				{addError ? (
					<p className="text-sm text-red-400">{addError}</p>
				) : null}

				{!isSearching &&
				!searchError &&
				debouncedQuery.length >= MIN_SEARCH_LENGTH &&
				searchResults.length === 0 ? (
					<p className="text-sm text-zinc-500">
						No mods found for that search.
					</p>
				) : null}

				{searchResults.length > 0 ? (
					<ul className="space-y-3">
						{searchResults.map((mod) => (
							<ModSearchResultRow
								key={mod.id}
								mod={mod}
								isAdded={addedModIds.has(mod.id)}
								isAdding={addingModId === mod.id}
								onAdd={() => void addMod(mod)}
							/>
						))}
					</ul>
				) : null}
			</section>

			<section className="space-y-4">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h2 className="text-lg font-semibold text-white">Mods in pack</h2>
						<p className="mt-1 text-sm text-zinc-500">
							{selectedMods.length === 0
								? 'No mods added yet.'
								: `${selectedMods.length} mod${selectedMods.length === 1 ? '' : 's'} selected`}
						</p>
					</div>
				</div>

				{selectedMods.length === 0 ? (
					<div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-[#111111]/50 px-6 py-12 text-center">
						<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/20">
							<Package className="h-6 w-6" />
						</span>
						<p className="mt-4 text-sm text-zinc-500">
							Search above and add mods to build your modpack list.
						</p>
					</div>
				) : (
					<ul className="space-y-3">
						{selectedMods.map((mod) => (
							<SelectedModRow
								key={mod.id}
								mod={mod}
								requiredForNames={getRequiredForNames(
									mod.id,
									requiredBy,
									modNameById
								)}
								onRemove={() => removeMod(mod.id)}
							/>
						))}
					</ul>
				)}
			</section>

			{saveError ? <p className="text-sm text-red-400">{saveError}</p> : null}

			<div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-8">
				<button
					type="button"
					onClick={() => void handleSave()}
					disabled={isSaving || (showTitleField && !title.trim())}
					className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-6 py-3 text-sm font-medium text-white ring-1 ring-violet-400/30 transition hover:from-violet-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isSaving ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							{savingLabel}
						</>
					) : (
						submitLabel
					)}
				</button>
				{footerHint ? (
					<p className="text-sm text-zinc-600">{footerHint}</p>
				) : null}
			</div>
		</div>
	);
}
