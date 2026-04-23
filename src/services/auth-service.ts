import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { LoginInput, RegisterInput } from "@/lib/validators/auth";

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
