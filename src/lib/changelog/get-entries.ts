import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type ChangelogEntry = {
  slug: string;
  title: string;
  date: string;
  content: string;
};

const changelogDir = path.join(process.cwd(), "content/changelog");

function normalizeChangelogDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

export function getChangelogSlugs(): string[] {
  return getChangelogEntries().map((entry) => entry.slug);
}

export function getChangelogEntry(slug: string): ChangelogEntry | null {
  const filePath = path.join(changelogDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    date: normalizeChangelogDate(data.date),
    content: content.trim(),
  };
}

export function getChangelogEntries(): ChangelogEntry[] {
  if (!fs.existsSync(changelogDir)) {
    return [];
  }

  const files = fs
    .readdirSync(changelogDir)
    .filter(
      (file) =>
        file.endsWith(".md") &&
        file.toLowerCase() !== "readme.md",
    );

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(changelogDir, file), "utf8");
      const { data, content } = matter(raw);

      return {
        slug,
        title: typeof data.title === "string" ? data.title : slug,
        date: normalizeChangelogDate(data.date),
        content: content.trim(),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
    );
}
