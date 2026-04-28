import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { addActivityToDayPlan } from "@/services/plan-service";

const addSchema = z.object({
  dayPlanId: z.string().min(1),
  activityId: z.string().min(1),
  plannedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable()
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const json = await request.json();
  const parsed = addSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const result = await addActivityToDayPlan(parsed.data.dayPlanId, parsed.data, { id: session.user.id, role: session.user.role });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ data: result.planItem }, { status: 201 });
}
