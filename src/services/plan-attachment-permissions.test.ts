import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany, create } = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    plan: {
      findMany,
      create
    }
  }
}));

import { createPlan } from "@/services/plan-service";

describe("createPlan attachment permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("limits attached day templates to the current user for non-admins", async () => {
    findMany.mockResolvedValue([{ id: "day-1" }]);
    create.mockResolvedValue({ id: "week-1" });

    await createPlan({
      type: "week",
      title: "Week template",
      workingDays: 2,
      weekDays: [
        { dayIndex: 0, attachedDayPlanId: "day-1" },
        { dayIndex: 1, attachedDayPlanId: "day-1" }
      ]
    }, { id: "u1", role: "user" });

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: { in: ["day-1"] },
        type: "day",
        authorId: "u1"
      }),
      select: { id: true }
    }));
  });

  it("does not restrict author when admin attaches day templates", async () => {
    findMany.mockResolvedValue([{ id: "day-2" }]);
    create.mockResolvedValue({ id: "week-2" });

    await createPlan({
      type: "week",
      title: "Admin week",
      workingDays: 2,
      weekDays: [
        { dayIndex: 0, attachedDayPlanId: "day-2" },
        { dayIndex: 1, attachedDayPlanId: "day-2" }
      ]
    }, { id: "admin-1", role: "admin" });

    const callArg = findMany.mock.calls[0]?.[0];
    expect(callArg.where.authorId).toBeUndefined();
  });

  it("throws when a non-admin references inaccessible attached day templates", async () => {
    findMany.mockResolvedValue([]);

    await expect(
      createPlan({
        type: "week",
        title: "Week template",
        workingDays: 2,
        weekDays: [
          { dayIndex: 0, attachedDayPlanId: "private-day-template" },
          { dayIndex: 1, attachedDayPlanId: "private-day-template" }
        ]
      }, { id: "u1", role: "user" })
    ).rejects.toThrow("Some attached day plans are invalid or inaccessible.");
  });
});
