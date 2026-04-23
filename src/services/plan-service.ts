import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { PlanInput } from "@/lib/validators/plan";

type SessionUser = { id: string; role: "user" | "admin" };

function ownerFilter(user: SessionUser): Prisma.PlanWhereInput {
  return user.role === "admin" ? {} : { authorId: user.id };
}

export async function listPlans(user: SessionUser) {
  return prisma.plan.findMany({
    where: ownerFilter(user),
    include: {
      author: { select: { id: true, name: true } },
      items: {
        include: { activity: { select: { id: true, title: true } } },
        orderBy: { orderIndex: "asc" }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getPlanById(id: string, user: SessionUser) {
  return prisma.plan.findFirst({
    where: { id, ...ownerFilter(user) },
    include: {
      author: { select: { id: true, name: true } },
      items: {
        include: { activity: { select: { id: true, title: true } } },
        orderBy: { orderIndex: "asc" }
      }
    }
  });
}

export async function createPlan(input: PlanInput, user: SessionUser) {
  const plan = await prisma.plan.create({
    data: {
      authorId: user.id,
      type: input.type,
      title: input.title,
      date: input.date ? new Date(input.date) : null,
      weekStartDate: input.weekStartDate ? new Date(input.weekStartDate) : null,
      items: {
        create: input.items.map((item) => ({
          activityId: item.activityId,
          orderIndex: item.orderIndex,
          notes: item.notes ?? null,
          plannedTime: item.plannedTime ? new Date(item.plannedTime) : null
        }))
      }
    }
  });

  return plan;
}

export async function updatePlan(id: string, input: PlanInput, user: SessionUser) {
  const existing = await prisma.plan.findFirst({ where: { id, ...ownerFilter(user) }, select: { id: true } });
  if (!existing) return { ok: false as const, status: 404, error: "Plan not found." };

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      type: input.type,
      title: input.title,
      date: input.date ? new Date(input.date) : null,
      weekStartDate: input.weekStartDate ? new Date(input.weekStartDate) : null,
      items: {
        deleteMany: {},
        create: input.items.map((item) => ({
          activityId: item.activityId,
          orderIndex: item.orderIndex,
          notes: item.notes ?? null,
          plannedTime: item.plannedTime ? new Date(item.plannedTime) : null
        }))
      }
    }
  });

  return { ok: true as const, plan: updated };
}

export async function deletePlan(id: string, user: SessionUser) {
  const existing = await prisma.plan.findFirst({ where: { id, ...ownerFilter(user) }, select: { id: true } });
  if (!existing) return { ok: false as const, status: 404, error: "Plan not found." };

  await prisma.plan.delete({ where: { id } });
  return { ok: true as const };
}
