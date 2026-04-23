import { NextResponse } from "next/server";

import { registerSchema } from "@/lib/validators/auth";
import { registerUser } from "@/services/auth-service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid registration data." },
      { status: 400 }
    );
  }

  const result = await registerUser(parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ user: result.user }, { status: 201 });
}
