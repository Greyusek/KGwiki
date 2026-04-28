"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type ActivityOption = { id: string; title: string };
type DayPlanOption = { id: string; title: string };

type PlanItemInput = {
  activityId: string;
  notes: string;
  plannedTime: string;
};

type WeekDayInput = {
  dayIndex: number;
  mode: "attach" | "inline";
  attachedDayPlanId: string;
  inlineItems: PlanItemInput[];
};

function createEmptyPlanItem(activities: ActivityOption[]): PlanItemInput {
  return { activityId: activities[0]?.id ?? "", notes: "", plannedTime: "" };
}

function createDefaultWeekDay(dayIndex: number, dayPlans: DayPlanOption[], activities: ActivityOption[]): WeekDayInput {
  return {
    dayIndex,
    mode: "attach",
    attachedDayPlanId: dayPlans[0]?.id ?? "",
    inlineItems: [createEmptyPlanItem(activities)]
  };
}

export function PlanForm({
  activities,
  dayPlans,
  initial,
  planId
}: {
  activities: ActivityOption[];
  dayPlans: DayPlanOption[];
  initial?: {
    type: "day" | "week";
    title: string;
    workingDays: number;
    items: PlanItemInput[];
    weekDays: WeekDayInput[];
  };
  planId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState<"day" | "week">(initial?.type ?? "day");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [items, setItems] = useState<PlanItemInput[]>(
    initial?.items.length ? initial.items : [createEmptyPlanItem(activities)]
  );
  const [workingDays, setWorkingDays] = useState<number>(initial?.workingDays ?? 5);
  const [weekDays, setWeekDays] = useState<WeekDayInput[]>(
    initial?.weekDays.length
      ? initial.weekDays
      : Array.from({ length: 5 }, (_, index) => createDefaultWeekDay(index, dayPlans, activities))
  );

  const visibleWeekDays = useMemo(
    () => [...weekDays]
      .sort((a, b) => a.dayIndex - b.dayIndex)
      .filter((day) => day.dayIndex < workingDays),
    [weekDays, workingDays]
  );

  function updateItem(index: number, updates: Partial<PlanItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  }

  function updateWeekDay(dayIndex: number, updates: Partial<WeekDayInput>) {
    setWeekDays((prev) => prev.map((day) => (day.dayIndex === dayIndex ? { ...day, ...updates } : day)));
  }

  function updateInlineItem(dayIndex: number, itemIndex: number, updates: Partial<PlanItemInput>) {
    setWeekDays((prev) => prev.map((day) => day.dayIndex !== dayIndex ? day : {
      ...day,
      inlineItems: day.inlineItems.map((item, idx) => idx === itemIndex ? { ...item, ...updates } : item)
    }));
  }

  function updateWorkingDays(value: number) {
    setWorkingDays(value);
    setWeekDays((prev) => {
      const existingByDay = new Map(prev.map((day) => [day.dayIndex, day]));
      return Array.from({ length: Math.max(value, prev.length) }, (_, index) => {
        return existingByDay.get(index) ?? createDefaultWeekDay(index, dayPlans, activities);
      });
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload = type === "day"
      ? {
          type,
          title,
          workingDays: undefined,
          items: items.map((item, index) => ({
            activityId: item.activityId,
            orderIndex: index,
            notes: item.notes || null,
            plannedTime: item.plannedTime || null
          }))
        }
      : {
          type,
          title,
          workingDays,
          weekDays: visibleWeekDays.map((day, index) => ({
            dayIndex: index,
            attachedDayPlanId: day.mode === "attach" ? day.attachedDayPlanId : null,
            inlineDayPlan: day.mode === "inline" ? {
              items: day.inlineItems.map((item, itemIndex) => ({
                activityId: item.activityId,
                orderIndex: itemIndex,
                notes: item.notes || null,
                plannedTime: item.plannedTime || null
              }))
            } : null
          }))
        };

    try {
      const response = await fetch(planId ? `/api/plans/${planId}` : "/api/plans", {
        method: planId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as { error?: string; data?: { id: string } };

      if (!response.ok) {
        setError(data.error ?? "Failed to save plan.");
        return;
      }

      router.push(planId ? `/plans/${planId}` : `/plans/${data.data?.id ?? ""}`);
      router.refresh();
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4 rounded-lg border p-4" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Plan type</span>
          <p className="text-xs text-muted-foreground">Day template is a reusable schedule made from activities. Week template is a reusable set of day templates.</p>
          <select className="w-full rounded-md border px-3 py-2" value={type} onChange={(event) => setType(event.target.value as "day" | "week")}>
            <option value="day">Day</option>
            <option value="week">Week</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Title</span>
          <p className="text-xs text-muted-foreground">Use a concise plan name (minimum 2 characters).</p>
          <input className="w-full rounded-md border px-3 py-2" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
      </div>

      {type === "day" ? (
        <>
          <div className="space-y-3">
            <h2 className="font-semibold">Day activities</h2>
            {items.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Activity</span>
                  <p className="text-xs text-muted-foreground">Choose an activity to include in this day. Activities may be your own, copied, or public.</p>
                  <select className="w-full rounded-md border px-3 py-2" value={item.activityId} onChange={(event) => updateItem(index, { activityId: event.target.value })} required>
                    {activities.map((activity) => (<option key={activity.id} value={activity.id}>{activity.title}</option>))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Planned time (optional)</span>
                  <p className="text-xs text-muted-foreground">Leave empty to place activity after timed items.</p>
                  <input type="time" className="w-full rounded-md border px-3 py-2" value={item.plannedTime} onChange={(event) => updateItem(index, { plannedTime: event.target.value })} />
                </label>
                <label className="space-y-1 text-sm sm:col-span-2">
                  <span className="font-medium">Notes (optional)</span>
                  <p className="text-xs text-muted-foreground">Add reminders, preparation notes, or adaptation hints.</p>
                  <textarea className="w-full rounded-md border px-3 py-2" value={item.notes} onChange={(event) => updateItem(index, { notes: event.target.value })} />
                </label>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setItems((prev) => [...prev, { activityId: activities[0]?.id ?? "", notes: "", plannedTime: "" }])}>Add activity</Button>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Working days</span>
              <select className="w-full rounded-md border px-3 py-2" value={workingDays} onChange={(event) => updateWorkingDays(Number(event.target.value))}>
                {[2,3,4,5,6].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <div className="space-y-3">
            {visibleWeekDays.map((day, index) => (
              <div key={index} className="space-y-2 rounded-md border p-3">
                <p className="font-medium">Day {index + 1}</p>
                <label className="text-sm">
                  <span className="font-medium">Mode</span>
                  <select className="ml-2 rounded border px-2 py-1" value={day.mode} onChange={(event) => updateWeekDay(day.dayIndex, { mode: event.target.value as "attach" | "inline" })}>
                    <option value="attach">Attach existing day plan</option>
                    <option value="inline">Create inline day plan</option>
                  </select>
                </label>
                {day.mode === "attach" ? (
                  <select className="w-full rounded border px-2 py-1 text-sm" value={day.attachedDayPlanId} onChange={(event) => updateWeekDay(day.dayIndex, { attachedDayPlanId: event.target.value })}>
                    {dayPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.title}</option>)}
                  </select>
                ) : (
                  <div className="space-y-2">
                    {day.inlineItems.map((item, itemIndex) => (
                      <div key={itemIndex} className="grid gap-2 rounded border p-2 sm:grid-cols-2">
                        <label className="space-y-1 text-sm sm:col-span-2">
                          <span className="font-medium">Activity</span>
                          <p className="text-xs text-muted-foreground">Choose an activity to include in this day. Activities may be your own, copied, or public.</p>
                          <select className="w-full rounded border px-2 py-1 text-sm" value={item.activityId} onChange={(event) => updateInlineItem(day.dayIndex, itemIndex, { activityId: event.target.value })}>
                            {activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}
                          </select>
                        </label>
                        <input type="time" className="rounded border px-2 py-1 text-sm" value={item.plannedTime} onChange={(event) => updateInlineItem(day.dayIndex, itemIndex, { plannedTime: event.target.value })} />
                        <textarea className="rounded border px-2 py-1 text-sm sm:col-span-2" placeholder="Notes (optional)" value={item.notes} onChange={(event) => updateInlineItem(day.dayIndex, itemIndex, { notes: event.target.value })} />
                        {day.inlineItems.length > 1 ? (
                          <Button type="button" variant="outline" className="sm:col-span-2" onClick={() => updateWeekDay(day.dayIndex, { inlineItems: day.inlineItems.filter((_, idx) => idx !== itemIndex) })}>
                            Remove activity
                          </Button>
                        ) : null}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateWeekDay(day.dayIndex, { inlineItems: [...day.inlineItems, createEmptyPlanItem(activities)] })}
                    >
                      Add activity
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save plan"}</Button>
    </form>
  );
}
