import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  ChangePasswordInput,
  LoginInput,
  RegisterInput
} from "@/lib/validators/auth";

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingUser) {
    return { ok: false as const, error: "Email is already registered." };
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: Role.user
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  });

  return { ok: true as const, user };
}

export async function verifyUserCredentials(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  return user;
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, status: 404, error: "User not found." };

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) return { ok: false as const, status: 400, error: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { ok: true as const };
}

export async function createPasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: true as const };

  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.verificationToken.deleteMany({ where: { identifier: `password-reset:${email}` } });
  await prisma.verificationToken.create({
    data: { identifier: `password-reset:${email}`, token: hashedToken, expires }
  });

  return { ok: true as const, token };
}

export async function resetPassword(token: string, newPassword: string) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.verificationToken.findUnique({ where: { token: hashedToken } });
  if (!record || record.expires < new Date() || !record.identifier.startsWith("password-reset:")) {
    return { ok: false as const, status: 400, error: "Invalid or expired reset token." };
  }
  const email = record.identifier.replace("password-reset:", "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false as const, status: 404, error: "User not found." };

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.verificationToken.delete({ where: { token: hashedToken } })
  ]);

  return { ok: true as const };
}
