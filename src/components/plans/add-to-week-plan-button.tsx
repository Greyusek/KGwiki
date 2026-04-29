"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type WeekPlan = {
  id: string;
  title: string;
  weekDays: { dayIndex: number; attachedDayPlanId: string | null; inlineDayPlanId: string | null }[];
};

export function AddToWeekPlanButton({ dayPlanId }: { dayPlanId: string }) {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<WeekPlan[]>([]);
  const [weekPlanId, setWeekPlanId] = useState("");
  const [dayIndex, setDayIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/plans/week-plans").then((r) => r.json()).then((data: { data?: WeekPlan[] }) => {
      const next = data.data ?? [];
      setPlans(next);
      setWeekPlanId((curr) => curr || next[0]?.id || "");
    });
  }, [open]);

  const selected = useMemo(() => plans.find((p) => p.id === weekPlanId), [plans, weekPlanId]);
  const emptySlots = useMemo(() => (selected?.weekDays ?? []).filter((d) => !d.attachedDayPlanId && !d.inlineDayPlanId), [selected]);

  async function submit() {
    if (!weekPlanId || dayIndex === null) return;
    const response = await fetch(`/api/plans/day-plans/${dayPlanId}/attach-week`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weekPlanId, dayIndex })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) return setMessage(data.error ?? "Unable to attach day plan.");
    setMessage("Day plan added to week plan.");
  }

  if (!open) return <Button variant="outline" onClick={() => setOpen(true)}>Add to week plan</Button>;

  return <div className="space-y-2 rounded-md border p-3 text-sm">
    <label className="block"><span className="font-medium">Week plan</span>
      <select className="mt-1 w-full rounded border px-2 py-1" value={weekPlanId} onChange={(e) => { setWeekPlanId(e.target.value); setDayIndex(null); }}>
        {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.title}</option>)}
      </select>
    </label>
    {emptySlots.length ? <label className="block"><span className="font-medium">Empty day slot</span>
      <select className="mt-1 w-full rounded border px-2 py-1" value={dayIndex ?? ""} onChange={(e) => setDayIndex(Number(e.target.value))}>
        <option value="" disabled>Select day</option>
        {emptySlots.map((slot) => <option key={slot.dayIndex} value={slot.dayIndex}>Day {slot.dayIndex + 1}</option>)}
      </select>
    </label> : <p className="text-xs text-muted-foreground">This week plan has no empty days. Remove or replace an existing day first.</p>}
    {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    <div className="flex gap-2">
      <Button size="sm" onClick={submit} disabled={!weekPlanId || dayIndex === null || !emptySlots.length}>Save</Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
    </div>
  </div>;
}
