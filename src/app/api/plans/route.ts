import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { planSchema } from "@/lib/validators/plan";
import { createPlan, listPlans } from "@/services/plan-service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const scope = searchParams.get("scope");

  const plans = await listPlans(
    { id: session.user.id, role: session.user.role },
    { type: type === "day" || type === "week" ? type : undefined, q, page, pageSize, scope: scope === "my" || scope === "available" || scope === "public" || scope === "shared" || scope === "all" ? scope : undefined }
  );
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

  try {
    const plan = await createPlan(parsed.data, { id: session.user.id, role: session.user.role });
    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create plan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
