import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "10"), 1), 10);

  if (q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        session.user.role === "admin" ? {} : { id: { not: session.user.id } },
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } }
          ]
        }
      ]
    },
    select: { id: true, name: true, email: true },
    take: limit,
    orderBy: [{ name: "asc" }, { email: "asc" }]
  });

  return NextResponse.json({ data: users });
}
