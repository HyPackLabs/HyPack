import { Archive, Link2 } from 'lucide-react';
import { exportOptions } from '@/lib/home-data';

const iconMap = {
	archive: Archive,
	link: Link2,
} as const;

export function ExportOptions() {
	return (
		<section className="px-6 py-20">
			<div className="mx-auto max-w-6xl text-center">
				<h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
					Download or share
				</h2>
				<p className="mx-auto mt-4 max-w-2xl text-zinc-400">
					When your modpack is ready, grab the files or send a link. That&apos;s
					it.
				</p>

				<div className="mt-12 grid gap-5 md:grid-cols-2">
					{exportOptions.map((option) => {
						const Icon = iconMap[option.icon];

						return (
							<article
								key={option.title}
								className="rounded-2xl border border-white/5 bg-[#111111] p-8 text-left"
							>
								<div
									className={`mb-5 inline-flex rounded-xl bg-linear-to-br ${option.tone} p-3 ring-1 ring-white/10`}
								>
									<Icon className="h-6 w-6 text-white" />
								</div>
								<h3 className="text-xl font-semibold text-white">
									{option.title}
								</h3>
								<p className="mt-3 text-sm leading-6 text-zinc-400">
									{option.description}
								</p>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
