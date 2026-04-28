import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { listDayPlansForUser } from "@/services/plan-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const plans = await listDayPlansForUser({ id: session.user.id, role: session.user.role });
  return NextResponse.json({ data: plans });
}
