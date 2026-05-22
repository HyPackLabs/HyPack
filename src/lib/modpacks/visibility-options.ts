import type { ModpackVisibility } from "@/lib/modpacks/types";

export const modpackVisibilityOptions: {
  value: ModpackVisibility;
  title: string;
  description: string;
  icon: "lock" | "link" | "globe";
}[] = [
  {
    value: "Private",
    title: "Private",
    description:
      "Only accessible by you. Others visiting the link will see a 404.",
    icon: "lock",
  },
  {
    value: "Unlisted",
    title: "Unlisted",
    description:
      "Anyone with the link can view the modpack, but it won't appear in search.",
    icon: "link",
  },
  {
    value: "Public",
    title: "Public",
    description:
      "Discoverable in search and shareable anywhere you want.",
    icon: "globe",
  },
];
