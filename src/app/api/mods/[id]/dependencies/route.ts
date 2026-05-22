import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getCurseForgeKeyError,
  isCurseForgeConfigured,
} from "@/lib/curseforge/client";
import { resolveRequiredDependencies } from "@/lib/curseforge/resolve-required-dependencies";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  const modId = Number(id);
  if (!Number.isInteger(modId) || modId <= 0) {
    return NextResponse.json({ error: "Invalid mod ID." }, { status: 400 });
  }

  try {
    const resolution = await resolveRequiredDependencies([modId]);
    return NextResponse.json(resolution);
  } catch (error) {
    console.error("Mod dependency resolution failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to resolve mod dependencies.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
