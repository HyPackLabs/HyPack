import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { duplicateModpack } from "@/lib/modpacks/duplicate-modpack";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await duplicateModpack(userId, id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ modpackId: result.modpackId });
}
