import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { exportModpackZip } from "@/lib/modpacks/export-modpack";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await auth();
  const { id } = await context.params;

  const result = await exportModpackZip(userId, id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
