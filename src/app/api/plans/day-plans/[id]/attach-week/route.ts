import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { attachDayPlanToWeekPlan } from "@/services/plan-service";

const schema = z.object({ weekPlanId: z.string().min(1), dayIndex: z.number().int().min(0) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { id } = await params;
  const result = await attachDayPlanToWeekPlan(id, parsed.data, { id: session.user.id, role: session.user.role });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ data: result.data });
}
