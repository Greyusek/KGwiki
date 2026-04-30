import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { PlanInput } from "@/lib/validators/plan";

type SessionUser = { id: string; role: "user" | "admin" };

function planAccessWhere(user: SessionUser): Prisma.PlanWhereInput {
  if (user.role === "admin") return {};
  return {
    OR: [
      { authorId: user.id },
      { visibility: "public" },
      { visibility: "shared", shares: { some: { userId: user.id } } }
    ]
  };
}

function editablePlanWhere(user: SessionUser): Prisma.PlanWhereInput {
  return user.role === "admin" ? {} : { authorId: user.id };
}

function accessibleAttachedDayPlanFilter(user: SessionUser): Prisma.PlanWhereInput {
  return {
    type: "day",
    isInlineOnly: false,
    ...planAccessWhere(user)
  };
}

function buildWeekDayCreateInput(day: NonNullable<PlanInput["weekDays"]>[number], userId: string): Prisma.WeekPlanDayCreateWithoutWeekPlanInput {
  return {
    dayIndex: day.dayIndex,
    ...(day.attachedDayPlanId ? { attachedDayPlan: { connect: { id: day.attachedDayPlanId } } } : {}),
    ...(day.inlineDayPlan
      ? {
          inlineDayPlan: {
            create: {
              authorId: userId,
              type: "day",
              title: (day.inlineTitle ?? "").trim() || `Day ${day.dayIndex + 1}`,
              isInlineOnly: true,
              visibility: "private",
              date: null,
              items: {
                create: day.inlineDayPlan.items.map((item, index) => ({
                  activityId: item.activityId,
                  orderIndex: index,
                  notes: item.notes ?? null,
                  plannedTime: item.plannedTime ?? null
                }))
              }
            }
          }
        }
      : {})
  };
}

function sortDayItems<T extends { plannedTime: string | null; orderIndex: number }>(items: T[]) {
  return [...items].sort((a, b) => {
    if (a.plannedTime && b.plannedTime) return a.plannedTime.localeCompare(b.plannedTime);
    if (a.plannedTime) return -1;
    if (b.plannedTime) return 1;
    return a.orderIndex - b.orderIndex;
  });
}

const dayPlanInclude = {
  author: { select: { id: true, name: true, bio: true } },
  shares: { select: { userId: true } },
  items: {
    include: {
      activity: { select: { id: true, title: true, summary: true, category: true, ageGroup: true } }
    }
  }
} satisfies Prisma.PlanInclude;

const weekPlanInclude = {
  ...dayPlanInclude,
  weekDays: {
    include: {
      attachedDayPlan: {
        include: dayPlanInclude
      },
      inlineDayPlan: {
        include: dayPlanInclude
      }
    },
    orderBy: { dayIndex: "asc" }
  }
} satisfies Prisma.PlanInclude;

export async function listPlans(user: SessionUser, query?: { type?: "day" | "week"; q?: string; page?: number; pageSize?: number; scope?: "my" | "available" | "public" | "shared" | "all" }) {
  const scope = query?.scope ?? "available";
  const scopeFilter: Prisma.PlanWhereInput = scope === "my"
    ? { authorId: user.id }
    : scope === "public"
      ? { visibility: "public" }
      : scope === "shared"
        ? { visibility: "shared", shares: { some: { userId: user.id } } }
        : scope === "all" && user.role === "admin"
          ? {}
          : planAccessWhere(user);

  const where: Prisma.PlanWhereInput = {
    ...scopeFilter,
    ...(query?.type ? { type: query.type } : {}),
    ...(query?.q ? { title: { contains: query.q, mode: "insensitive" } } : {})
  };
  const page = Math.max(query?.page ?? 1, 1);
  const pageSize = Math.min(Math.max(query?.pageSize ?? 10, 1), 50);

  const [items, total] = await Promise.all([
    prisma.plan.findMany({ where, include: weekPlanInclude, orderBy: { updatedAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.plan.count({ where })
  ]);

  return { items: items.map((plan) => ({ ...plan, items: sortDayItems(plan.items) })), total, page, pageSize };
}

export async function listDayPlansForUser(user: SessionUser) {
  return prisma.plan.findMany({ where: accessibleAttachedDayPlanFilter(user), select: { id: true, title: true }, orderBy: { updatedAt: "desc" } });
}

export async function getPlanById(id: string, user: SessionUser) {
  const plan = await prisma.plan.findFirst({ where: { id, ...planAccessWhere(user) }, include: weekPlanInclude });
  if (!plan) return null;
  return {
    ...plan,
    items: sortDayItems(plan.items),
    weekDays: plan.weekDays.map((day) => ({ ...day, attachedDayPlan: day.attachedDayPlan ? { ...day.attachedDayPlan, items: sortDayItems(day.attachedDayPlan.items) } : null, inlineDayPlan: day.inlineDayPlan ? { ...day.inlineDayPlan, items: sortDayItems(day.inlineDayPlan.items) } : null }))
  };
}

function shareData(input: PlanInput, userId: string) {
  const uniqueIds = [...new Set((input.sharedUserIds ?? []).filter((id) => id !== userId))];
  return input.visibility === "shared" ? { create: uniqueIds.map((id) => ({ userId: id })) } : undefined;
}

export async function createPlan(input: PlanInput, user: SessionUser) {
  if (input.type === "day") {
    return prisma.plan.create({
      data: { authorId: user.id, type: "day", title: input.title, visibility: input.visibility, shares: shareData(input, user.id), isInlineOnly: false, date: null, items: { create: (input.items ?? []).map((item, index) => ({ activityId: item.activityId, orderIndex: index, notes: item.notes ?? null, plannedTime: item.plannedTime ?? null })) } }
    });
  }

  const attachedIds = Array.from(new Set((input.weekDays ?? []).map((day) => day.attachedDayPlanId).filter((value): value is string => Boolean(value))));
  if (attachedIds.length) {
    const validAttachedPlans = await prisma.plan.findMany({ where: { id: { in: attachedIds }, ...accessibleAttachedDayPlanFilter(user) }, select: { id: true } });
    if (validAttachedPlans.length !== attachedIds.length) throw new Error("Some attached day plans are invalid or inaccessible.");
  }

  return prisma.plan.create({
    data: {
      authorId: user.id,
      type: "week",
      title: input.title,
      visibility: input.visibility,
      shares: shareData(input, user.id),
      weekDays: { create: (input.weekDays ?? []).map((day) => buildWeekDayCreateInput(day, user.id)) }
    }
  });
}

export async function updatePlan(id: string, input: PlanInput, user: SessionUser) {
  const existing = await prisma.plan.findFirst({ where: { id, ...editablePlanWhere(user) }, select: { id: true } });
  if (!existing) return { ok: false as const, status: 404, error: "Plan not found." };

  if (input.type === "week") {
    const attachedIds = Array.from(new Set((input.weekDays ?? []).map((day) => day.attachedDayPlanId).filter((value): value is string => Boolean(value))));
    if (attachedIds.length) {
      const validAttachedPlans = await prisma.plan.findMany({ where: { id: { in: attachedIds }, ...accessibleAttachedDayPlanFilter(user) }, select: { id: true } });
      if (validAttachedPlans.length !== attachedIds.length) return { ok: false as const, status: 400, error: "Some attached day plans are invalid or inaccessible." };
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.planShare.deleteMany({ where: { planId: id } });
    if (input.type === "day") {
      return tx.plan.update({ where: { id }, data: { type: "day", title: input.title, visibility: input.visibility, shares: shareData(input, user.id), isInlineOnly: false, date: null, weekDays: { deleteMany: {} }, items: { deleteMany: {}, create: (input.items ?? []).map((item, index) => ({ activityId: item.activityId, orderIndex: index, notes: item.notes ?? null, plannedTime: item.plannedTime ?? null })) } } });
    }

    const oldWeekDays = await tx.weekPlanDay.findMany({ where: { weekPlanId: id }, select: { inlineDayPlanId: true } });
    await tx.weekPlanDay.deleteMany({ where: { weekPlanId: id } });
    const inlineIds = oldWeekDays.map((entry) => entry.inlineDayPlanId).filter((value): value is string => Boolean(value));
    if (inlineIds.length) await tx.plan.deleteMany({ where: { id: { in: inlineIds } } });

    return tx.plan.update({ where: { id }, data: { type: "week", title: input.title, visibility: input.visibility, shares: shareData(input, user.id), date: null, items: { deleteMany: {} }, weekDays: { create: (input.weekDays ?? []).map((day) => buildWeekDayCreateInput(day, user.id)) } } });
  });

  return { ok: true as const, plan: updated };
}

export async function deletePlan(id: string, user: SessionUser) {
  const existing = await prisma.plan.findFirst({ where: { id, ...editablePlanWhere(user) }, select: { id: true } });
  if (!existing) return { ok: false as const, status: 404, error: "Plan not found." };
  await prisma.plan.delete({ where: { id } });
  return { ok: true as const };
}

export function canEditPlan(planAuthorId: string, user: SessionUser) {
  return user.role === "admin" || planAuthorId === user.id;
}

export function sortDayPlanItemsForTest<T extends { plannedTime: string | null; orderIndex: number }>(items: T[]) {
  return sortDayItems(items);
}
