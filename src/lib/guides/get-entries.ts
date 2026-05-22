import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { formatGuideCategoryLabel } from "@/lib/guides/format-category";

export type GuideEntry = {
  slug: string;
  title: string;
  date: string;
  content: string;
  category: string | null;
};

export type GuideCategory = {
  slug: string;
  label: string;
};

const guidesDir = path.join(process.cwd(), "content/guides");

function normalizeGuideDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

function parseGuideFile(
  filePath: string,
  slug: string,
  category: string | null,
): GuideEntry {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    date: normalizeGuideDate(data.date),
    content: content.trim(),
    category,
  };
}

function collectGuidesFromDir(
  dir: string,
  category: string | null,
): GuideEntry[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries: GuideEntry[] = [];

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name.toLowerCase() === "readme.md") {
      continue;
    }

    const itemPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      entries.push(...collectGuidesFromDir(itemPath, item.name));
      continue;
    }

    if (!item.name.endsWith(".md")) {
      continue;
    }

    const fileSlug = item.name.replace(/\.md$/, "");
    const slug = category ? `${category}/${fileSlug}` : fileSlug;
    entries.push(parseGuideFile(itemPath, slug, category));
  }

  return entries;
}

export function getGuideCategories(): GuideCategory[] {
  const categories = new Set(
    getGuideEntries()
      .map((entry) => entry.category)
      .filter((category): category is string => category !== null),
  );

  return Array.from(categories)
    .sort()
    .map((slug) => ({
      slug,
      label: formatGuideCategoryLabel(slug),
    }));
}

export function getGuideSlugs(): string[] {
  return getGuideEntries().map((entry) => entry.slug);
}

export function getGuideEntry(slug: string): GuideEntry | null {
  const segments = slug.split("/").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const filePath = path.join(guidesDir, ...segments.slice(0, -1), `${segments.at(-1)}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const category = segments.length > 1 ? segments[0] : null;
  return parseGuideFile(filePath, slug, category);
}

export function getGuideEntries(category?: string): GuideEntry[] {
  const entries = collectGuidesFromDir(guidesDir, null).sort(
    (a, b) =>
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
  );

  if (!category) {
    return entries;
  }

  return entries.filter((entry) => entry.category === category);
}
