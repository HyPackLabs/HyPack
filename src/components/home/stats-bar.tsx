import { getHomeStats } from "@/lib/home/get-home-stats";

export async function StatsBar() {
  const stats = await getHomeStats();

  return (
    <section className="px-6 pb-20">
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-8 text-center"
          >
            <p className="text-3xl font-semibold tracking-tight text-white">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
