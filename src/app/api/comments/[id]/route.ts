import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { deleteComment, updateComment } from "@/services/social-service";

const updateCommentSchema = z.object({
  content: z.string().trim().min(2).max(1500)
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { id } = await params;
  const result = await updateComment(id, parsed.data.content, { id: session.user.id, role: session.user.role });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ data: result.comment });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteComment(id, { id: session.user.id, role: session.user.role });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ data: { deleted: true } });
}
