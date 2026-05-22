import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getCurseForgeKeyError,
  isCurseForgeConfigured,
} from "@/lib/curseforge/client";
import { searchHytaleMods } from "@/lib/curseforge/search-mods";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCurseForgeConfigured()) {
    return NextResponse.json(
      {
        error:
          getCurseForgeKeyError() ??
          "CurseForge API is not configured on the server.",
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const index = Number(searchParams.get("index") ?? "0");

  if (!query.trim()) {
    return NextResponse.json({
      data: [],
      pagination: { index: 0, pageSize: 20, resultCount: 0, totalCount: 0 },
    });
  }

  try {
    const result = await searchHytaleMods(query, Number.isNaN(index) ? 0 : index);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Mod search failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to search mods.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
