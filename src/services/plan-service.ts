import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { PlanInput } from "@/lib/validators/plan";

type SessionUser = { id: string; role: "user" | "admin" };

function ownerFilter(user: SessionUser): Prisma.PlanWhereInput {
  return user.role === "admin" ? {} : { authorId: user.id };
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

export async function listPlans(user: SessionUser, query?: { type?: "day" | "week"; q?: string; page?: number; pageSize?: number }) {
  const where: Prisma.PlanWhereInput = {
    ...ownerFilter(user),
    ...(query?.type ? { type: query.type } : {}),
    ...(query?.q ? { title: { contains: query.q, mode: "insensitive" } } : {})
  };
  const page = Math.max(query?.page ?? 1, 1);
  const pageSize = Math.min(Math.max(query?.pageSize ?? 10, 1), 50);

  const [items, total] = await Promise.all([
    prisma.plan.findMany({
      where,
      include: weekPlanInclude,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.plan.count({ where })
  ]);

  return {
    items: items.map((plan) => ({
      ...plan,
      items: sortDayItems(plan.items)
    })),
    total,
    page,
    pageSize
  };
}

export async function listDayPlansForUser(user: SessionUser) {
  return prisma.plan.findMany({
    where: { ...ownerFilter(user), type: "day" },
    select: { id: true, title: true, date: true },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getPlanById(id: string, user: SessionUser) {
  const plan = await prisma.plan.findFirst({
    where: { id, ...ownerFilter(user) },
    include: weekPlanInclude
  });
  if (!plan) return null;

  return {
    ...plan,
    items: sortDayItems(plan.items),
    weekDays: plan.weekDays.map((day) => ({
      ...day,
      attachedDayPlan: day.attachedDayPlan
        ? { ...day.attachedDayPlan, items: sortDayItems(day.attachedDayPlan.items) }
        : null,
      inlineDayPlan: day.inlineDayPlan
        ? { ...day.inlineDayPlan, items: sortDayItems(day.inlineDayPlan.items) }
        : null
    }))
  };
}

export async function createPlan(input: PlanInput, user: SessionUser) {
  if (input.type === "day") {
    const plan = await prisma.plan.create({
      data: {
        authorId: user.id,
        type: "day",
        title: input.title,
        date: new Date(input.date!),
        items: {
          create: (input.items ?? []).map((item, index) => ({
            activityId: item.activityId,
            orderIndex: index,
            notes: item.notes ?? null,
            plannedTime: item.plannedTime ?? null
          }))
        }
      }
    });
    return plan;
  }

  const weekDays = input.weekDays ?? [];
  const plan = await prisma.plan.create({
    data: {
      authorId: user.id,
      type: "week",
      title: input.title,
      weekStartDate: new Date(input.weekStartDate!),
      weekDays: {
        create: weekDays.map((day) => ({
          dayIndex: day.dayIndex,
          attachedDayPlanId: day.attachedDayPlanId ?? null,
          inlineDayPlan: day.inlineDayPlan
            ? {
                create: {
                  authorId: user.id,
                  type: "day",
                  title: day.inlineDayPlan.title,
                  date: new Date(day.inlineDayPlan.date),
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
            : undefined
        }))
      }
    }
  });

  return plan;
}

export async function updatePlan(id: string, input: PlanInput, user: SessionUser) {
  const existing = await prisma.plan.findFirst({ where: { id, ...ownerFilter(user) }, select: { id: true } });
  if (!existing) return { ok: false as const, status: 404, error: "Plan not found." };

  const updated = await prisma.$transaction(async (tx) => {
    if (input.type === "day") {
      return tx.plan.update({
        where: { id },
        data: {
          type: "day",
          title: input.title,
          date: new Date(input.date!),
          weekStartDate: null,
          weekDays: { deleteMany: {} },
          items: {
            deleteMany: {},
            create: (input.items ?? []).map((item, index) => ({
              activityId: item.activityId,
              orderIndex: index,
              notes: item.notes ?? null,
              plannedTime: item.plannedTime ?? null
            }))
          }
        }
      });
    }

    const oldWeekDays = await tx.weekPlanDay.findMany({ where: { weekPlanId: id }, select: { inlineDayPlanId: true } });
    await tx.weekPlanDay.deleteMany({ where: { weekPlanId: id } });
    const inlineIds = oldWeekDays.map((entry) => entry.inlineDayPlanId).filter((value): value is string => Boolean(value));
    if (inlineIds.length) {
      await tx.plan.deleteMany({ where: { id: { in: inlineIds } } });
    }

    return tx.plan.update({
      where: { id },
      data: {
        type: "week",
        title: input.title,
        date: null,
        weekStartDate: new Date(input.weekStartDate!),
        items: { deleteMany: {} },
        weekDays: {
          create: (input.weekDays ?? []).map((day) => ({
            dayIndex: day.dayIndex,
            attachedDayPlanId: day.attachedDayPlanId ?? null,
            inlineDayPlan: day.inlineDayPlan
              ? {
                  create: {
                    authorId: user.id,
                    type: "day",
                    title: day.inlineDayPlan.title,
                    date: new Date(day.inlineDayPlan.date),
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
              : undefined
          }))
        }
      }
    });
  });

  return { ok: true as const, plan: updated };
}

export async function addActivityToDayPlan(
  dayPlanId: string,
  input: { activityId: string; plannedTime?: string | null; notes?: string | null },
  user: SessionUser
) {
  const dayPlan = await prisma.plan.findFirst({
    where: { id: dayPlanId, type: "day", ...ownerFilter(user) },
    select: { id: true }
  });
  if (!dayPlan) {
    return { ok: false as const, status: 404, error: "Day plan not found." };
  }

  const activity = await prisma.activity.findUnique({ where: { id: input.activityId }, select: { id: true } });
  if (!activity) {
    return { ok: false as const, status: 404, error: "Activity not found." };
  }

  const maxOrder = await prisma.planItem.aggregate({ where: { planId: dayPlanId }, _max: { orderIndex: true } });
  const planItem = await prisma.planItem.create({
    data: {
      planId: dayPlanId,
      activityId: input.activityId,
      orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
      plannedTime: input.plannedTime ?? null,
      notes: input.notes ?? null
    }
  });

  return { ok: true as const, planItem };
}

export async function deletePlan(id: string, user: SessionUser) {
  const existing = await prisma.plan.findFirst({ where: { id, ...ownerFilter(user) }, select: { id: true } });
  if (!existing) return { ok: false as const, status: 404, error: "Plan not found." };

  await prisma.plan.delete({ where: { id } });
  return { ok: true as const };
}

export function sortDayPlanItemsForTest<T extends { plannedTime: string | null; orderIndex: number }>(items: T[]) {
  return sortDayItems(items);
}
