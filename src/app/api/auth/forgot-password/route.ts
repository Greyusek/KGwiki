import { NextResponse } from "next/server";

import { forgotPasswordSchema } from "@/lib/validators/auth";
import { createPasswordResetToken } from "@/services/auth-service";

const GENERIC_MESSAGE = "If an account with this email exists, reset instructions have been generated.";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid email." }, { status: 400 });
  }

  const result = await createPasswordResetToken(parsed.data.email);
  if (process.env.NODE_ENV !== "production" && result.ok && "token" in result && result.token) {
    console.log(`[DEV] Password reset link for ${parsed.data.email}: /reset-password?token=${result.token}`);
  }

  return NextResponse.json({ data: { sent: true, message: GENERIC_MESSAGE } });
}
