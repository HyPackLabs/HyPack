import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export function Hero() {
	return (
		<section className="relative isolate min-h-128 overflow-hidden px-6 pb-16 pt-20 text-center sm:min-h-144 sm:pb-20 sm:pt-28">
			<div className="absolute inset-0 -z-10">
				<div className="relative h-full min-h-128 w-full sm:min-h-144">
					<Image
						src="/hero_banner.png"
						alt=""
						fill
						priority
						sizes="100vw"
						className="object-cover object-center"
					/>
				</div>

				<div className="absolute inset-0 bg-[#080808]/55" />
				<div className="absolute inset-0 bg-linear-to-b from-[#080808]/30 via-[#080808]/60 to-[#080808]" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_55%)]" />
				<div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#080808] to-transparent" />
			</div>

			<div className="relative mx-auto max-w-4xl">
				<p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-violet-300/80">
					Hytale modpack builder
				</p>
				<h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.05]">
					Share the Hytale mods you use with anyone.
				</h1>
				<p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-300 sm:text-xl">
					Modpacks, but without the hassle.
				</p>

				<div className="mt-10 flex justify-center">
					<Link
						href="/modpacks"
						className="group inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-violet-500 to-indigo-500 px-6 py-3.5 text-base font-medium text-white shadow-[0_0_40px_rgba(124,58,237,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_48px_rgba(124,58,237,0.45)]"
					>
						<Plus className="h-5 w-5 transition group-hover:rotate-90" />
						Create a new modpack
					</Link>
				</div>
			</div>
		</section>
	);
}
