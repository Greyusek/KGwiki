import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  avatar: z.string().trim().url().optional().or(z.literal("")),
  bio: z.string().trim().max(300).optional().or(z.literal(""))
});

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const json = await request.json();
  const parsed = profileSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      avatar: parsed.data.avatar || null,
      bio: parsed.data.bio || null
    },
    select: { id: true, name: true, email: true, role: true, avatar: true, bio: true }
  });

  return NextResponse.json({ data: updated });
}
