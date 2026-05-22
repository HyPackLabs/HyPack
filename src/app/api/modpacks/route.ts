import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createModpack } from "@/lib/modpacks/create-modpack";

type CreateModpackBody = {
  title?: string;
  modIds?: number[];
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateModpackBody;
  try {
    body = (await request.json()) as CreateModpackBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title : "";
  const modIds = Array.isArray(body.modIds)
    ? body.modIds.filter((id): id is number => typeof id === "number")
    : [];

  const result = await createModpack(userId, { title, modIds });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ modpackId: result.modpackId });
}
