import { clerkClient } from "@clerk/nextjs/server";

import { getHytaleModCountDisplay } from "@/lib/curseforge/get-hytale-mod-count";
import { formatDownloads } from "@/lib/modpacks/format-downloads";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export type HomeStat = {
  label: string;
  value: string;
};

export async function getHomeStats(): Promise<HomeStat[]> {
  const [registeredUsers, modpacksCreated, modsListed] = await Promise.all([
    getRegisteredUsersCount(),
    getModpacksCount(),
    getHytaleModCountDisplay(),
  ]);

  return [
    { label: "Registered users", value: registeredUsers },
    { label: "Modpacks created", value: modpacksCreated },
    { label: "Mods listed", value: modsListed },
  ];
}

async function getRegisteredUsersCount(): Promise<string> {
  if (!process.env.CLERK_SECRET_KEY) {
    return "—";
  }

  try {
    const client = await clerkClient();
    const { totalCount } = await client.users.getUserList({ limit: 1 });
    return formatDownloads(totalCount);
  } catch {
    return "—";
  }
}

async function getModpacksCount(): Promise<string> {
  if (!isSupabaseConfigured()) {
    return "—";
  }

  try {
    const supabase = createServerSupabaseClient();
    const { count, error } = await supabase
      .from("modpacks")
      .select("*", { count: "exact", head: true });

    if (error || count === null) {
      return "—";
    }

    return formatDownloads(count);
  } catch {
    return "—";
  }
}
