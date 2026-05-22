import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  content: string;
};

const blogDir = path.join(process.cwd(), "content/blog");

function normalizeBlogDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

export function getBlogSlugs(): string[] {
  return getBlogPosts().map((post) => post.slug);
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(blogDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    date: normalizeBlogDate(data.date),
    content: content.trim(),
  };
}

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs
    .readdirSync(blogDir)
    .filter(
      (file) =>
        file.endsWith(".md") &&
        file.toLowerCase() !== "readme.md",
    );

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
      const { data, content } = matter(raw);

      return {
        slug,
        title: typeof data.title === "string" ? data.title : slug,
        date: normalizeBlogDate(data.date),
        content: content.trim(),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
    );
}
