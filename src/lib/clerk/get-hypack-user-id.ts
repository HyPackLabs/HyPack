import { clerkClient } from "@clerk/nextjs/server";

const HYPACK_USERNAME = "hypack";

export async function getHypackUserId(): Promise<string | null> {
  const fromEnv = process.env.HYPACK_FEATURED_CLERK_USER_ID?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  if (!process.env.CLERK_SECRET_KEY) {
    return null;
  }

  try {
    const client = await clerkClient();
    const { data } = await client.users.getUserList({
      username: [HYPACK_USERNAME],
      limit: 1,
    });

    return data[0]?.id ?? null;
  } catch {
    return null;
  }
}
