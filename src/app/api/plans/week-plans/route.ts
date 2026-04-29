import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const plans = await prisma.plan.findMany({
    where: { type: "week", ...(session.user.role === "admin" ? {} : { authorId: session.user.id }) },
    select: { id: true, title: true, weekDays: { select: { dayIndex: true, attachedDayPlanId: true, inlineDayPlanId: true }, orderBy: { dayIndex: "asc" } } },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ data: plans });
}
