import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { planSchema } from "@/lib/validators/plan";
import { deletePlan, getPlanById, updatePlan } from "@/services/plan-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const plan = await getPlanById(id, { id: session.user.id, role: session.user.role });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  }

  return NextResponse.json({ data: plan });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const json = await request.json();
  const parsed = planSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { id } = await params;
  const result = await updatePlan(id, parsed.data, { id: session.user.id, role: session.user.role });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ data: result.plan });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const result = await deletePlan(id, { id: session.user.id, role: session.user.role });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ data: { deleted: true } });
}
