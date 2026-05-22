export type FeaturedMod = {
  id: number;
  name: string;
  slug: string;
  description: string;
  downloads: string;
  provider: "CurseForge";
  accent: string;
  logoUrl: string;
};

export type FeaturedModpack = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  isHypackTeam?: boolean;
  likes: number;
  visibility: "Private" | "Unlisted" | "Public";
  updatedAt: string;
};

export const featuredMods: FeaturedMod[] = [
  {
    id: 1430352,
    name: "BetterMap",
    slug: "bettermap",
    description:
      "Enhanced world map tools for exploration, waypoints, and sharing discoveries with your party.",
    downloads: "796k",
    provider: "CurseForge",
    accent: "from-emerald-500/20 to-teal-600/10",
    logoUrl:
      "https://media.forgecdn.net/avatars/thumbnails/1763/122/256/256/639121281719878876.png",
  },
  {
    id: 1423494,
    name: "EyeSpy",
    slug: "eyespy",
    description:
      "See more of the world around you with quality-of-life awareness and discovery helpers.",
    downloads: "617k",
    provider: "CurseForge",
    accent: "from-sky-500/20 to-blue-600/10",
    logoUrl:
      "https://media.forgecdn.net/avatars/thumbnails/1601/204/256/256/639034455468020786.png",
  },
  {
    id: 1427562,
    name: "Wan's Wonder Weapons",
    slug: "wans-wonder-weapons",
    description:
      "A growing arsenal of unique weapons and combat abilities to shake up your adventures.",
    downloads: "546k",
    provider: "CurseForge",
    accent: "from-violet-500/20 to-purple-600/10",
    logoUrl:
      "https://media.forgecdn.net/avatars/thumbnails/1610/680/256/256/639039173114824794.png",
  },
  {
    id: 1431645,
    name: "RPG Leveling And Stats",
    slug: "rpg-leveling-and-stats",
    description:
      "Progression systems with stats, skills, and RPG-style character growth for longer campaigns.",
    downloads: "442k",
    provider: "CurseForge",
    accent: "from-amber-500/20 to-orange-600/10",
    logoUrl:
      "https://media.forgecdn.net/avatars/thumbnails/1646/988/256/256/639051510141166334.png",
  },
];

export const visibilityOptions = [
  {
    title: "Private",
    description: "Only you can view and edit the modpack.",
    icon: "lock" as const,
    accent: "violet" as const,
  },
  {
    title: "Unlisted",
    description: "Anyone with the link can view the modpack, but it won't appear in search.",
    icon: "link" as const,
    accent: "sky" as const,
  },
  {
    title: "Public",
    description: "Discoverable in search and shareable anywhere you want.",
    icon: "globe" as const,
    accent: "emerald" as const,
  },
] as const;

export const exportOptions = [
  {
    title: "Download as ZIP",
    description:
      "Grab every mod in your pack as a ready-to-drop archive for your Hytale server or client.",
    icon: "archive" as const,
    tone: "from-violet-500/20 to-indigo-600/10",
  },
  {
    title: "Share a link",
    description:
      "Send a HyPack link so friends can view your mod list and install the same setup.",
    icon: "link" as const,
    tone: "from-fuchsia-500/20 to-pink-600/10",
  },
] as const;
