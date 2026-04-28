"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type DayPlanOption = { id: string; title: string };

export function AddToDayPlanButton({ activityId, className }: { activityId: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<DayPlanOption[]>([]);
  const [dayPlanId, setDayPlanId] = useState("");
  const [plannedTime, setPlannedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/plans/day-plans")
      .then((response) => response.json())
      .then((data: { data?: DayPlanOption[] }) => {
        const nextPlans = data.data ?? [];
        setPlans(nextPlans);
        setDayPlanId((current) => current || nextPlans[0]?.id || "");
      })
      .catch(() => setPlans([]));
  }, [open]);

  async function submit() {
    setMessage(null);
    const response = await fetch("/api/plans/day-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayPlanId,
        activityId,
        plannedTime: plannedTime || null,
        notes: notes || null
      })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Unable to add activity.");
      return;
    }
    setMessage("Added to day plan.");
  }

  if (!open) {
    return (
      <Button variant="outline" className={className} onClick={() => setOpen(true)}>
        Add to day plan
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border p-3 text-sm">
      <label className="block">
        <span className="font-medium">Day plan</span>
        <select className="mt-1 w-full rounded border px-2 py-1" value={dayPlanId} onChange={(event) => setDayPlanId(event.target.value)}>
          {plans.map((plan) => (
            <option value={plan.id} key={plan.id}>
              {plan.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="font-medium">Planned time (optional)</span>
        <input type="time" className="mt-1 w-full rounded border px-2 py-1" value={plannedTime} onChange={(event) => setPlannedTime(event.target.value)} />
      </label>
      <label className="block">
        <span className="font-medium">Notes (optional)</span>
        <textarea className="mt-1 w-full rounded border px-2 py-1" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={!dayPlanId}>Save</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
      </div>
    </div>
  );
}
