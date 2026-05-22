'use client';

import { useEffect, useState } from 'react';
import { Globe, Link2, Lock } from 'lucide-react';
import { visibilityOptions } from '@/lib/home-data';

const iconMap = {
	lock: Lock,
	link: Link2,
	globe: Globe,
} as const;

const accentStyles = {
	violet: {
		glow: 'border-violet-400/40 bg-linear-to-b from-violet-500/[0.12] to-transparent shadow-[0_0_0_1px_rgba(167,139,250,0.15),0_20px_50px_rgba(124,58,237,0.18)]',
		icon: 'bg-violet-500/20 text-violet-200 ring-violet-400/30',
	},
	sky: {
		glow: 'border-sky-400/40 bg-linear-to-b from-sky-500/[0.12] to-transparent shadow-[0_0_0_1px_rgba(56,189,248,0.15),0_20px_50px_rgba(14,165,233,0.18)]',
		icon: 'bg-sky-500/20 text-sky-200 ring-sky-400/30',
	},
	emerald: {
		glow: 'border-emerald-400/40 bg-linear-to-b from-emerald-500/[0.12] to-transparent shadow-[0_0_0_1px_rgba(52,211,153,0.15),0_20px_50px_rgba(16,185,129,0.18)]',
		icon: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30',
	},
} as const;

const CYCLE_MS = 3000;

export function VisibilityCards() {
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setActiveIndex((current) => (current + 1) % visibilityOptions.length);
		}, CYCLE_MS);

		return () => window.clearInterval(timer);
	}, []);

	return (
		<section className="px-6 py-20">
			<div className="mx-auto max-w-6xl text-center">
				<h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
					Share with your friends
				</h2>
				<p className="mx-auto mt-4 max-w-2xl text-zinc-400">
					Or publish the link publicly anywhere you want.
				</p>

				<div className="mt-12 grid gap-4 md:grid-cols-3">
					{visibilityOptions.map((option, index) => {
						const Icon = iconMap[option.icon];
						const isActive = index === activeIndex;
						const accent = accentStyles[option.accent];

						return (
							<article
								key={option.title}
								className={`relative overflow-hidden rounded-2xl border border-white/5 bg-[#0f0f0f] p-6 text-left transition-transform duration-500 ease-out ${
									isActive ? 'scale-[1.02]' : 'scale-100'
								}`}
							>
								<div
									aria-hidden
									className={`pointer-events-none absolute inset-0 rounded-2xl border transition-opacity duration-500 ease-out ${accent.glow} ${
										isActive ? 'opacity-100' : 'opacity-0'
									}`}
								/>
								<div className="relative">
									<div
										className={`mb-4 inline-flex rounded-xl p-2.5 ring-1 ring-inset transition-colors duration-500 ease-out ${
											isActive
												? accent.icon
												: 'bg-white/5 text-zinc-500 ring-white/5'
										}`}
									>
										<Icon className="h-5 w-5" />
									</div>
									<h3
										className={`text-lg font-semibold transition-colors duration-500 ease-out ${
											isActive ? 'text-white' : 'text-zinc-500'
										}`}
									>
										{option.title}
									</h3>
									<p
										className={`mt-2 text-sm leading-6 transition-colors duration-500 ease-out ${
											isActive ? 'text-zinc-300' : 'text-zinc-600'
										}`}
									>
										{option.description}
									</p>
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
