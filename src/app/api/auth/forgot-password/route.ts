import { NextResponse } from "next/server";

import { forgotPasswordSchema } from "@/lib/validators/auth";
import { createPasswordResetToken } from "@/services/auth-service";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid email." }, { status: 400 });
  }

  const result = await createPasswordResetToken(parsed.data.email);
  const resetUrl = result.ok && "token" in result && result.token
    ? `/reset-password?token=${result.token}`
    : null;

  return NextResponse.json({
    data: {
      sent: true,
      resetUrl
    }
  });
}
