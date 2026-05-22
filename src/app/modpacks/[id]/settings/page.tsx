import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ModpackSettingsForm } from "@/components/modpacks/modpack-settings-form";
import { getModpackDetail } from "@/lib/modpacks/get-modpack-detail";

type ModpackSettingsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ModpackSettingsPageProps) {
  const { id } = await params;
  const { userId } = await auth();
  const modpack = userId ? await getModpackDetail(userId, id) : null;

  return {
    title: modpack
      ? `Settings — ${modpack.title} — HyPack`
      : "Modpack settings — HyPack",
  };
}

export default async function ModpackSettingsPage({
  params,
}: ModpackSettingsPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const modpack = await getModpackDetail(userId, id);
  if (!modpack) {
    notFound();
  }

  return (
    <div className="flex min-h-full flex-col bg-[#080808]">
      <Header />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <ModpackSettingsForm modpack={modpack} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
