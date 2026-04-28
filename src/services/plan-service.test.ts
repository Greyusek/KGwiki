import { describe, expect, it } from "vitest";

import { sortDayPlanItemsForTest } from "@/services/plan-service";

describe("sortDayPlanItemsForTest", () => {
  it("sorts by planned time and keeps untimed items at the end", () => {
    const sorted = sortDayPlanItemsForTest([
      { plannedTime: null, orderIndex: 0, id: "a" },
      { plannedTime: "11:00", orderIndex: 1, id: "b" },
      { plannedTime: "09:30", orderIndex: 2, id: "c" },
      { plannedTime: null, orderIndex: 3, id: "d" }
    ]);

    expect(sorted.map((entry) => entry.id)).toEqual(["c", "b", "a", "d"]);
  });
});
