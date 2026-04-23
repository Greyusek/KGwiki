import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { activityInputSchema } from "@/lib/validators/activity";
import { createActivity } from "@/services/activity-service";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = activityInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const activity = await createActivity(parsed.data, {
    id: session.user.id,
    role: session.user.role
  });

  return NextResponse.json({ data: { id: activity.id } }, { status: 201 });
}
