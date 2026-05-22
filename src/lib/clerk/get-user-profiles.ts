import { clerkClient } from "@clerk/nextjs/server";
import type { ModpackCreator } from "@/lib/modpacks/types";

function formatClerkDisplayName(user: {
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: { emailAddress: string }[];
}): string {
  if (user.username) {
    return user.username;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (fullName) {
    return fullName;
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (email) {
    return email.split("@")[0] ?? "User";
  }

  return "User";
}

function mapClerkUser(user: {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses: { emailAddress: string }[];
}): ModpackCreator {
  return {
    id: user.id,
    displayName: formatClerkDisplayName(user),
    avatarUrl: user.imageUrl || null,
  };
}

export async function getClerkUserProfile(
  userId: string,
): Promise<ModpackCreator | null> {
  if (!process.env.CLERK_SECRET_KEY) {
    return null;
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return mapClerkUser(user);
  } catch {
    return null;
  }
}

export async function getClerkUserProfiles(
  userIds: string[],
): Promise<Map<string, ModpackCreator>> {
  const profiles = new Map<string, ModpackCreator>();
  const uniqueIds = [...new Set(userIds)];

  if (!process.env.CLERK_SECRET_KEY || uniqueIds.length === 0) {
    return profiles;
  }

  const client = await clerkClient();
  const results = await Promise.all(
    uniqueIds.map(async (userId) => {
      try {
        const user = await client.users.getUser(userId);
        return mapClerkUser(user);
      } catch {
        return {
          id: userId,
          displayName: "Unknown user",
          avatarUrl: null,
        } satisfies ModpackCreator;
      }
    }),
  );

  for (const profile of results) {
    profiles.set(profile.id, profile);
  }

  return profiles;
}
