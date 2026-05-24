import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteModpack } from "@/lib/modpacks/delete-modpack";
import { updateModpack } from "@/lib/modpacks/update-modpack";
import { updateModpackContent } from "@/lib/modpacks/update-modpack-content";
import type { PackDependencyState } from "@/lib/modpacks/mod-dependency-selection";
import type { ModpackVisibility } from "@/lib/modpacks/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateModpackBody = {
  title?: string;
  description?: string;
  visibility?: ModpackVisibility;
  modIds?: number[];
  dependencyState?: PackDependencyState | null;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  let body: UpdateModpackBody;
  try {
    body = (await request.json()) as UpdateModpackBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (Array.isArray(body.modIds)) {
    const result = await updateModpackContent(userId, id, {
      ...(typeof body.title === "string" ? { title: body.title } : {}),
      modIds: body.modIds.filter(
        (modId): modId is number => typeof modId === "number" && Number.isInteger(modId),
      ),
      dependencyState: body.dependencyState ?? null,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  }

  const result = await updateModpack(userId, id, {
    title: typeof body.title === "string" ? body.title : "",
    description: typeof body.description === "string" ? body.description : "",
    visibility: body.visibility ?? "Private",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteModpack(userId, id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Could not delete modpack." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
