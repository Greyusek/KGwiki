import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { planSchema } from "@/lib/validators/plan";
import { createPlan, listPlans } from "@/services/plan-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const plans = await listPlans({ id: session.user.id, role: session.user.role });
  return NextResponse.json({ data: plans });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const json = await request.json();
  const parsed = planSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const plan = await createPlan(parsed.data, { id: session.user.id, role: session.user.role });
  return NextResponse.json({ data: plan }, { status: 201 });
}
