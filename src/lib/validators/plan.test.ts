import { describe, expect, it } from "vitest";

import { planSchema } from "@/lib/validators/plan";

describe("planSchema", () => {
  it("accepts day templates without a fixed date", () => {
    const parsed = planSchema.safeParse({
      type: "day",
      title: "No-date day template",
      items: [
        { activityId: "a1", orderIndex: 0, plannedTime: null, notes: null },
        { activityId: "a2", orderIndex: 1, plannedTime: "10:30", notes: "Bring cards" }
      ]
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts week plans with mixed inline and attached days", () => {
    const parsed = planSchema.safeParse({
      type: "week",
      title: "Mixed week template",
      workingDays: 2,
      weekDays: [
        {
          dayIndex: 0,
          inlineDayPlan: {
            items: [
              { activityId: "a1", orderIndex: 0, plannedTime: "08:30", notes: null },
              { activityId: "a2", orderIndex: 1, plannedTime: null, notes: null }
            ]
          }
        },
        {
          dayIndex: 1,
          attachedDayPlanId: "day-template-1"
        }
      ]
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts week plans with all inline days", () => {
    const parsed = planSchema.safeParse({
      type: "week",
      title: "Inline only",
      workingDays: 2,
      weekDays: [
        { dayIndex: 0, inlineDayPlan: { items: [{ activityId: "a1", orderIndex: 0 }] } },
        { dayIndex: 1, inlineDayPlan: { items: [{ activityId: "a2", orderIndex: 0 }] } }
      ]
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts week plans with all attached days", () => {
    const parsed = planSchema.safeParse({
      type: "week",
      title: "Attached only",
      workingDays: 2,
      weekDays: [
        { dayIndex: 0, attachedDayPlanId: "day-template-1" },
        { dayIndex: 1, attachedDayPlanId: "day-template-2" }
      ]
    });

    expect(parsed.success).toBe(true);
  });
});
