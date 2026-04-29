import { beforeEach, describe, expect, it, vi } from "vitest";

describe("day-plans route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("saves inline day plan as reusable day plan", async () => {
    const createPlan = vi.fn(async () => ({ id: "dp-1", title: "Saved from week" }));
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/services/plan-service", () => ({ createPlan, listDayPlansForUser: vi.fn() }));

    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/plans/day-plans", {
      method: "POST",
      body: JSON.stringify({
        title: "Saved from week",
        items: [
          { activityId: "a1", orderIndex: 0, plannedTime: "09:00", notes: "N1" },
          { activityId: "a2", orderIndex: 1, plannedTime: null, notes: "N2" }
        ]
      })
    }));

    expect(response.status).toBe(201);
    expect(createPlan).toHaveBeenCalledWith(expect.objectContaining({ type: "day", title: "Saved from week" }), { id: "u1", role: "user" });
  });

  it("validates missing title", async () => {
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/services/plan-service", () => ({ createPlan: vi.fn(), listDayPlansForUser: vi.fn() }));
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost/api/plans/day-plans", {
      method: "POST",
      body: JSON.stringify({ title: "", items: [{ activityId: "a1", orderIndex: 0, plannedTime: null, notes: null }] })
    }));

    expect(response.status).toBe(400);
  });

  it("validates no activities", async () => {
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/services/plan-service", () => ({ createPlan: vi.fn(), listDayPlansForUser: vi.fn() }));
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost/api/plans/day-plans", {
      method: "POST",
      body: JSON.stringify({ title: "Inline save", items: [] })
    }));

    expect(response.status).toBe(400);
  });
});
