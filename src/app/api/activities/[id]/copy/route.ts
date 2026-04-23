import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { copyActivityToUser } from "@/services/social-service";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const result = await copyActivityToUser(id, { id: session.user.id, role: session.user.role });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ data: { id: result.activity.id } }, { status: 201 });
}
