import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ModpackListPaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  query?: string;
};

function buildHref(
  basePath: string,
  page: number,
  query?: string,
): string {
  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

export function ModpackListPagination({
  basePath,
  page,
  totalPages,
  query = "",
}: ModpackListPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label="Modpack list pagination"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={buildHref(basePath, page - 1, query)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-zinc-300 transition hover:border-violet-400/30 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 px-3 py-2 text-sm text-zinc-600">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </span>
      )}

      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-zinc-600">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(basePath, item, query)}
            aria-current={item === page ? "page" : undefined}
            className={`inline-flex min-w-10 items-center justify-center rounded-lg border px-3 py-2 text-sm transition ${
              item === page
                ? "border-violet-400/40 bg-violet-500/15 text-white"
                : "border-white/10 bg-[#111111] text-zinc-300 hover:border-violet-400/30 hover:text-white"
            }`}
          >
            {item}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, page + 1, query)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-zinc-300 transition hover:border-violet-400/30 hover:text-white"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 px-3 py-2 text-sm text-zinc-600">
          Next
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

function getVisiblePages(
  page: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];

  if (page > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }

  if (page < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);
  return pages;
}
