import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    plan: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn()
    },
    weekPlanDay: {
      findMany: vi.fn(),
      deleteMany: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { createPlan, sortDayPlanItemsForTest, updatePlan } from "@/services/plan-service";

describe("plan-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.plan.create.mockResolvedValue({ id: "plan-1" });
    prismaMock.plan.findMany.mockResolvedValue([]);
    prismaMock.plan.findFirst.mockResolvedValue({ id: "plan-1" });
    prismaMock.weekPlanDay.findMany.mockResolvedValue([]);
    prismaMock.weekPlanDay.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.plan.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.plan.update.mockResolvedValue({ id: "plan-1" });
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<unknown>) => callback(prismaMock));
  });

  it("sorts by planned time and keeps untimed items at the end", () => {
    const sorted = sortDayPlanItemsForTest([
      { plannedTime: null, orderIndex: 0, id: "a" },
      { plannedTime: "11:00", orderIndex: 1, id: "b" },
      { plannedTime: "09:30", orderIndex: 2, id: "c" },
      { plannedTime: null, orderIndex: 3, id: "d" }
    ]);

    expect(sorted.map((entry) => entry.id)).toEqual(["c", "b", "a", "d"]);
  });

  it("creates day template without date", async () => {
    await createPlan({
      type: "day",
      title: "Day Template",
      items: [{ activityId: "a1", orderIndex: 0, plannedTime: "09:00", notes: null }]
    }, { id: "u1", role: "user" });

    expect(prismaMock.plan.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: "day", date: null })
    }));
  });

  it("creates week template with attached relation using connect syntax", async () => {
    prismaMock.plan.findMany.mockResolvedValue([{ id: "day-1" }]);

    await createPlan({
      type: "week",
      title: "Week Template",
      workingDays: 1,
      weekDays: [{ dayIndex: 0, attachedDayPlanId: "day-1" }]
    }, { id: "u1", role: "user" });

    expect(prismaMock.plan.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        weekDays: {
          create: [expect.objectContaining({
            attachedDayPlan: { connect: { id: "day-1" } }
          })]
        }
      })
    }));
  });

  it("creates week template with only inline days", async () => {
    await createPlan({
      type: "week",
      title: "Inline Week",
      workingDays: 2,
      weekDays: [
        {
          dayIndex: 0,
          inlineDayPlan: {
            items: [
              { activityId: "a1", orderIndex: 0, plannedTime: "09:00", notes: null },
              { activityId: "a2", orderIndex: 1, plannedTime: null, notes: null }
            ]
          }
        },
        {
          dayIndex: 1,
          inlineDayPlan: {
            items: [{ activityId: "a3", orderIndex: 0, plannedTime: null, notes: null }]
          }
        }
      ]
    }, { id: "u1", role: "user" });

    expect(prismaMock.plan.create).toHaveBeenCalledTimes(1);
  });

  it("accepts accessible attached day templates for regular user", async () => {
    prismaMock.plan.findMany.mockResolvedValue([{ id: "day-1" }]);

    await expect(createPlan({
      type: "week",
      title: "Attach Week",
      workingDays: 1,
      weekDays: [{ dayIndex: 0, attachedDayPlanId: "day-1" }]
    }, { id: "u1", role: "user" })).resolves.toBeTruthy();

    expect(prismaMock.plan.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: { in: ["day-1"] }, type: "day", authorId: "u1" })
    }));
  });

  it("rejects inaccessible private attached day template for regular user", async () => {
    prismaMock.plan.findMany.mockResolvedValue([]);

    await expect(createPlan({
      type: "week",
      title: "Attach Week",
      workingDays: 1,
      weekDays: [{ dayIndex: 0, attachedDayPlanId: "day-2" }]
    }, { id: "u1", role: "user" })).rejects.toThrow("Some attached day plans are invalid or inaccessible.");
  });

  it("allows admin to attach any day template during update", async () => {
    prismaMock.plan.findMany.mockResolvedValue([{ id: "day-any" }]);

    const result = await updatePlan("plan-1", {
      type: "week",
      title: "Week",
      workingDays: 1,
      weekDays: [{ dayIndex: 0, attachedDayPlanId: "day-any" }]
    }, { id: "admin-1", role: "admin" });

    expect(result.ok).toBe(true);
    expect(prismaMock.plan.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: { in: ["day-any"] }, type: "day" })
    }));
  });

  it("saves week update with mixed inline + attached days", async () => {
    prismaMock.plan.findMany.mockResolvedValue([{ id: "day-1" }]);

    const result = await updatePlan("plan-1", {
      type: "week",
      title: "Week Mixed",
      workingDays: 2,
      weekDays: [
        {
          dayIndex: 0,
          inlineDayPlan: {
            items: [
              { activityId: "a1", orderIndex: 0, plannedTime: "09:00", notes: null },
              { activityId: "a2", orderIndex: 1, plannedTime: null, notes: null }
            ]
          }
        },
        { dayIndex: 1, attachedDayPlanId: "day-1" }
      ]
    }, { id: "u1", role: "user" });

    expect(result.ok).toBe(true);
    expect(prismaMock.plan.update).toHaveBeenCalledTimes(1);
  });
});
