import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createPlan, listDayPlansForUser } from "@/services/plan-service";
import { saveInlineDayPlanSchema } from "@/lib/validators/plan";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const plans = await listDayPlansForUser({ id: session.user.id, role: session.user.role });
  return NextResponse.json({ data: plans });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = saveInlineDayPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  const plan = await createPlan({ type: "day", title: parsed.data.title, visibility: "private", sharedUserIds: [], items: parsed.data.items }, { id: session.user.id, role: session.user.role });
  return NextResponse.json({ data: { id: plan.id, title: plan.title } }, { status: 201 });
}
