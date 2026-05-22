type ExploreContext = {
  from: "explore";
  query?: string;
  page?: number;
};

export function buildModpackDetailHref(
  modpackId: string,
  exploreContext?: ExploreContext,
): string {
  if (!exploreContext) {
    return `/modpacks/${modpackId}`;
  }

  const params = new URLSearchParams({ from: "explore" });
  if (exploreContext.query) {
    params.set("q", exploreContext.query);
  }
  if (exploreContext.page && exploreContext.page > 1) {
    params.set("page", String(exploreContext.page));
  }

  return `/modpacks/${modpackId}?${params.toString()}`;
}

export function getModpackDetailBackLink(
  searchParams: { from?: string; q?: string; page?: string },
  isOwner: boolean,
): { href: string; label: string } {
  if (searchParams.from === "explore") {
    const params = new URLSearchParams();
    if (searchParams.q) {
      params.set("q", searchParams.q);
    }

    const page = Number.parseInt(searchParams.page ?? "1", 10);
    if (Number.isFinite(page) && page > 1) {
      params.set("page", String(page));
    }

    const search = params.toString();
    return {
      href: search ? `/explore?${search}` : "/explore",
      label: "Back to explore",
    };
  }

  if (isOwner) {
    return { href: "/modpacks", label: "Back to modpacks" };
  }

  return { href: "/", label: "Back to home" };
}
