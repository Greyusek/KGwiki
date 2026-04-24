import { NextResponse } from "next/server";

import { resetPasswordSchema } from "@/lib/validators/auth";
import { resetPassword } from "@/services/auth-service";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const result = await resetPassword(parsed.data.token, parsed.data.newPassword);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ data: { reset: true } });
}
