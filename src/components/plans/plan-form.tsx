"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";

type ActivityOption = { id: string; title: string };

type PlanItemInput = {
  activityId: string;
  orderIndex: number;
  notes: string;
  plannedTime: string;
};

export function PlanForm({
  activities,
  initial,
  planId
}: {
  activities: ActivityOption[];
  initial?: {
    type: "day" | "week";
    title: string;
    date: string;
    weekStartDate: string;
    items: PlanItemInput[];
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
  const [items, setItems] = useState<PlanItemInput[]>(
    initial?.items.length ? initial.items : [{ activityId: activities[0]?.id ?? "", orderIndex: 0, notes: "", plannedTime: "" }]
  );

  function updateItem(index: number, updates: Partial<PlanItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      type,
      title,
      date: type === "day" ? date : null,
      weekStartDate: type === "week" ? weekStartDate : null,
      items: items.map((item, index) => ({
        activityId: item.activityId,
        orderIndex: index,
        notes: item.notes || null,
        plannedTime: item.plannedTime ? new Date(item.plannedTime).toISOString() : null
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
        <label className="space-y-1 text-sm">
          <span className="font-medium">Date</span>
          <input type="date" className="w-full rounded-md border px-3 py-2" value={date} onChange={(event) => setDate(event.target.value)} required />
        </label>
      ) : (
        <label className="space-y-1 text-sm">
          <span className="font-medium">Week start date</span>
          <input type="date" className="w-full rounded-md border px-3 py-2" value={weekStartDate} onChange={(event) => setWeekStartDate(event.target.value)} required />
        </label>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold">Plan items</h2>
        {items.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Activity</span>
              <select className="w-full rounded-md border px-3 py-2" value={item.activityId} onChange={(event) => updateItem(index, { activityId: event.target.value })} required>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Planned time (optional)</span>
              <input type="datetime-local" className="w-full rounded-md border px-3 py-2" value={item.plannedTime} onChange={(event) => updateItem(index, { plannedTime: event.target.value })} />
            </label>
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">Notes (optional)</span>
              <textarea className="w-full rounded-md border px-3 py-2" value={item.notes} onChange={(event) => updateItem(index, { notes: event.target.value })} />
            </label>
          </div>
        ))}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setItems((prev) => [...prev, { activityId: activities[0]?.id ?? "", orderIndex: prev.length, notes: "", plannedTime: "" }])}>
            Add item
          </Button>
          {items.length > 1 ? (
            <Button type="button" variant="outline" onClick={() => setItems((prev) => prev.slice(0, -1))}>
              Remove last item
            </Button>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving..." : "Save plan"}
      </Button>
    </form>
  );
}
