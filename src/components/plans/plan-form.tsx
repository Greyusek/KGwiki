"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type ActivityOption = { id: string; title: string };
type DayPlanOption = { id: string; title: string; date: string };

type PlanItemInput = {
  activityId: string;
  notes: string;
  plannedTime: string;
};

type WeekDayInput = {
  dayIndex: number;
  mode: "attach" | "inline";
  attachedDayPlanId: string;
  inlineTitle: string;
  inlineDate: string;
  inlineItems: PlanItemInput[];
};

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
    date: string;
    weekStartDate: string;
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
  const [date, setDate] = useState(initial?.date ?? "");
  const [weekStartDate, setWeekStartDate] = useState(initial?.weekStartDate ?? "");
  const [items, setItems] = useState<PlanItemInput[]>(initial?.items.length ? initial.items : [{ activityId: activities[0]?.id ?? "", notes: "", plannedTime: "" }]);
  const [workingDays, setWorkingDays] = useState<number>(initial?.weekDays.length ?? 5);
  const [weekDays, setWeekDays] = useState<WeekDayInput[]>(
    initial?.weekDays.length
      ? initial.weekDays
      : Array.from({ length: 5 }, (_, index) => ({
          dayIndex: index,
          mode: "attach",
          attachedDayPlanId: dayPlans[0]?.id ?? "",
          inlineTitle: `Day ${index + 1}`,
          inlineDate: "",
          inlineItems: [{ activityId: activities[0]?.id ?? "", notes: "", plannedTime: "" }]
        }))
  );

  const visibleWeekDays = useMemo(() => weekDays.slice(0, workingDays), [weekDays, workingDays]);

  function updateItem(index: number, updates: Partial<PlanItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  }

  function updateWeekDay(index: number, updates: Partial<WeekDayInput>) {
    setWeekDays((prev) => prev.map((day, i) => (i === index ? { ...day, ...updates } : day)));
  }

  function updateInlineItem(dayIndex: number, itemIndex: number, updates: Partial<PlanItemInput>) {
    setWeekDays((prev) => prev.map((day, i) => i !== dayIndex ? day : {
      ...day,
      inlineItems: day.inlineItems.map((item, idx) => idx === itemIndex ? { ...item, ...updates } : item)
    }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload = type === "day"
      ? {
          type,
          title,
          date,
          weekStartDate: null,
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
          date: null,
          weekStartDate,
          weekDays: visibleWeekDays.map((day, index) => ({
            dayIndex: index,
            attachedDayPlanId: day.mode === "attach" ? day.attachedDayPlanId : null,
            inlineDayPlan: day.mode === "inline" ? {
              title: day.inlineTitle,
              date: day.inlineDate,
              items: day.inlineItems.map((item, itemIndex) => ({
                activityId: item.activityId,
                orderIndex: itemIndex,
                notes: item.notes || null,
                plannedTime: item.plannedTime || null
              }))
            } : null
          }))
        };

    const response = await fetch(planId ? `/api/plans/${planId}` : "/api/plans", {
      method: planId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { error?: string; data?: { id: string } };

    if (!response.ok) {
      setError(data.error ?? "Failed to save plan.");
      setBusy(false);
      return;
    }

    router.push(planId ? `/plans/${planId}` : `/plans/${data.data?.id ?? ""}`);
    router.refresh();
  }

  return (
    <form className="space-y-4 rounded-lg border p-4" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Plan type</span>
          <select className="w-full rounded-md border px-3 py-2" value={type} onChange={(event) => setType(event.target.value as "day" | "week")}>
            <option value="day">Day</option>
            <option value="week">Week</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Title</span>
          <input className="w-full rounded-md border px-3 py-2" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
      </div>

      {type === "day" ? (
        <>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Date</span>
            <input type="date" className="w-full rounded-md border px-3 py-2" value={date} onChange={(event) => setDate(event.target.value)} required />
          </label>
          <div className="space-y-3">
            <h2 className="font-semibold">Day activities</h2>
            {items.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Activity</span>
                  <select className="w-full rounded-md border px-3 py-2" value={item.activityId} onChange={(event) => updateItem(index, { activityId: event.target.value })} required>
                    {activities.map((activity) => (<option key={activity.id} value={activity.id}>{activity.title}</option>))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Planned time (optional)</span>
                  <input type="time" className="w-full rounded-md border px-3 py-2" value={item.plannedTime} onChange={(event) => updateItem(index, { plannedTime: event.target.value })} />
                </label>
                <label className="space-y-1 text-sm sm:col-span-2">
                  <span className="font-medium">Notes (optional)</span>
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
              <span className="font-medium">Week start date</span>
              <input type="date" className="w-full rounded-md border px-3 py-2" value={weekStartDate} onChange={(event) => setWeekStartDate(event.target.value)} required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Working days</span>
              <select className="w-full rounded-md border px-3 py-2" value={workingDays} onChange={(event) => setWorkingDays(Number(event.target.value))}>
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
                  <select className="ml-2 rounded border px-2 py-1" value={day.mode} onChange={(event) => updateWeekDay(index, { mode: event.target.value as "attach" | "inline" })}>
                    <option value="attach">Attach existing day plan</option>
                    <option value="inline">Create inline day plan</option>
                  </select>
                </label>
                {day.mode === "attach" ? (
                  <select className="w-full rounded border px-2 py-1 text-sm" value={day.attachedDayPlanId} onChange={(event) => updateWeekDay(index, { attachedDayPlanId: event.target.value })}>
                    {dayPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.title}</option>)}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input className="w-full rounded border px-2 py-1 text-sm" placeholder="Inline day title" value={day.inlineTitle} onChange={(event) => updateWeekDay(index, { inlineTitle: event.target.value })} />
                    <input type="date" className="w-full rounded border px-2 py-1 text-sm" value={day.inlineDate} onChange={(event) => updateWeekDay(index, { inlineDate: event.target.value })} />
                    {day.inlineItems.map((item, itemIndex) => (
                      <div key={itemIndex} className="grid gap-2 sm:grid-cols-2">
                        <select className="rounded border px-2 py-1 text-sm" value={item.activityId} onChange={(event) => updateInlineItem(index, itemIndex, { activityId: event.target.value })}>
                          {activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}
                        </select>
                        <input type="time" className="rounded border px-2 py-1 text-sm" value={item.plannedTime} onChange={(event) => updateInlineItem(index, itemIndex, { plannedTime: event.target.value })} />
                      </div>
                    ))}
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
