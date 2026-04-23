import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { commentInputSchema } from "@/lib/validators/social";
import { addComment } from "@/services/social-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = commentInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { id } = await params;
  const result = await addComment(id, parsed.data, { id: session.user.id, role: session.user.role });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ data: { id: result.comment.id } }, { status: 201 });
}
