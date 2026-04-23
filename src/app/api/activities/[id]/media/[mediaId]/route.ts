import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { removeActivityMedia } from "@/services/activity-service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id, mediaId } = await params;
  const result = await removeActivityMedia(id, mediaId, {
    id: session.user.id,
    role: session.user.role
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ data: { deleted: true } });
}
