import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  removeModpackIcon,
  uploadModpackIcon,
} from "@/lib/modpacks/upload-modpack-icon";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const icon = formData.get("icon");
  if (!(icon instanceof File) || icon.size === 0) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  const result = await uploadModpackIcon(userId, id, icon);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ iconUrl: result.iconUrl });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await removeModpackIcon(userId, id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
