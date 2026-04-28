import { beforeEach, describe, expect, it, vi } from "vitest";

describe("plans routes", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates day plan", async () => {
    const createPlan = vi.fn(async () => ({ id: "day1" }));
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/services/plan-service", () => ({ createPlan, listPlans: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 10 })) }));

    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/plans", {
      method: "POST",
      body: JSON.stringify({
        type: "day",
        title: "Day A",
        items: [{ activityId: "a1", orderIndex: 0, plannedTime: "09:30" }]
      })
    }));

    expect(response.status).toBe(201);
    expect(createPlan).toHaveBeenCalledTimes(1);
  });

  it("creates week plan with working days", async () => {
    const createPlan = vi.fn(async () => ({ id: "week1" }));
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/services/plan-service", () => ({ createPlan, listPlans: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 10 })) }));

    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/plans", {
      method: "POST",
      body: JSON.stringify({
        type: "week",
        title: "Week A",
        workingDays: 2,
        weekDays: [
          { dayIndex: 0, attachedDayPlanId: "day-a" },
          { dayIndex: 1, attachedDayPlanId: "day-b" }
        ]
      })
    }));

    expect(response.status).toBe(201);
    expect(createPlan).toHaveBeenCalledTimes(1);
  });

  it("creates week plan with inline days and multiple activities", async () => {
    const createPlan = vi.fn(async () => ({ id: "week-inline-1" }));
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/services/plan-service", () => ({ createPlan, listPlans: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 10 })) }));

    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/plans", {
      method: "POST",
      body: JSON.stringify({
        type: "week",
        title: "Week Inline",
        workingDays: 2,
        weekDays: [
          {
            dayIndex: 0,
            inlineDayPlan: {
              items: [
                { activityId: "a1", orderIndex: 0, plannedTime: "09:00", notes: null },
                { activityId: "a2", orderIndex: 1, plannedTime: null, notes: "Optional item" }
              ]
            }
          },
          {
            dayIndex: 1,
            inlineDayPlan: {
              items: [
                { activityId: "a3", orderIndex: 0, plannedTime: "08:30", notes: null },
                { activityId: "a4", orderIndex: 1, plannedTime: "10:00", notes: null }
              ]
            }
          }
        ]
      })
    }));

    expect(response.status).toBe(201);
    expect(createPlan).toHaveBeenCalledTimes(1);
  });

  it("blocks editing plan from another user", async () => {
    const updatePlan = vi.fn(async () => ({ ok: false as const, status: 404, error: "Plan not found." }));
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u2", role: "user" } }) }));
    vi.doMock("@/services/plan-service", () => ({ updatePlan, getPlanById: vi.fn(), deletePlan: vi.fn() }));

    const { PUT } = await import("./[id]/route");
    const response = await PUT(new Request("http://localhost/api/plans/p1", {
      method: "PUT",
      body: JSON.stringify({
        type: "day",
        title: "Day A",
        items: [{ activityId: "a1", orderIndex: 0, plannedTime: "09:30" }]
      })
    }), { params: Promise.resolve({ id: "p1" }) });

    expect(response.status).toBe(404);
    expect(updatePlan).toHaveBeenCalledTimes(1);
  });

  it("creates week plan with mixed inline and attached days", async () => {
    const createPlan = vi.fn(async () => ({ id: "week-mixed-1" }));
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/services/plan-service", () => ({ createPlan, listPlans: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 10 })) }));

    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/plans", {
      method: "POST",
      body: JSON.stringify({
        type: "week",
        title: "Week Mixed",
        workingDays: 2,
        weekDays: [
          {
            dayIndex: 0,
            inlineDayPlan: {
              items: [
                { activityId: "a1", orderIndex: 0, plannedTime: "09:00", notes: null },
                { activityId: "a2", orderIndex: 1, plannedTime: "11:00", notes: null }
              ]
            }
          },
          { dayIndex: 1, attachedDayPlanId: "day-a" }
        ]
      })
    }));

    expect(response.status).toBe(201);
    expect(createPlan).toHaveBeenCalledTimes(1);
  });

  it("adds public activity to day plan", async () => {
    const addActivityToDayPlan = vi.fn(async () => ({ ok: true as const, planItem: { id: "pi1" } }));
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/services/plan-service", () => ({ addActivityToDayPlan }));

    const { POST } = await import("./day-items/route");
    const response = await POST(new Request("http://localhost/api/plans/day-items", {
      method: "POST",
      body: JSON.stringify({ dayPlanId: "d1", activityId: "public-a1", plannedTime: "10:15" })
    }));
    expect(response.status).toBe(201);
    expect(addActivityToDayPlan).toHaveBeenCalledTimes(1);
  });
});
