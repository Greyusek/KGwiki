"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type ActivityOption = { id: string; title: string };
type DayPlanOption = { id: string; title: string };
type ShareUserOption = { id: string; name: string | null; email: string };

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
    inlineTitle: "",
    inlineItems: [createEmptyPlanItem(activities)]
  };
}

export function PlanForm({
  activities,
  dayPlans,
  initial,
  planId,
  initialShareUsers
}: {
  activities: ActivityOption[];
  dayPlans: DayPlanOption[];
  initial?: {
    type: "day" | "week";
    title: string;
    workingDays: number;
    visibility?: "private" | "public" | "shared";
    sharedUserIds?: string[];
    items: PlanItemInput[];
    weekDays: WeekDayInput[];
  };
  planId?: string;
  initialShareUsers: ShareUserOption[];
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
  const [visibility, setVisibility] = useState<"private" | "public" | "shared">(initial?.visibility ?? "private");
  const [sharedUserIds, setSharedUserIds] = useState<string[]>(initial?.sharedUserIds ?? []);
  const [selectedSharedUsers, setSelectedSharedUsers] = useState<ShareUserOption[]>(
    initialShareUsers.filter((user) => (initial?.sharedUserIds ?? []).includes(user.id))
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShareUserOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [availableDayPlans, setAvailableDayPlans] = useState<DayPlanOption[]>(dayPlans);
  const [weekDays, setWeekDays] = useState<WeekDayInput[]>(
    initial?.weekDays.length
      ? initial.weekDays.map((entry) => ({ ...entry, inlineTitle: entry.inlineTitle ?? "" }))
      : Array.from({ length: 5 }, (_, index) => createDefaultWeekDay(index, dayPlans, activities))
  );

  const visibleWeekDays = useMemo(
    () => [...weekDays]
      .sort((a, b) => a.dayIndex - b.dayIndex)
      .filter((day) => day.dayIndex < workingDays),
    [weekDays, workingDays]
  );
  const selectedUserSet = useMemo(() => new Set(sharedUserIds), [sharedUserIds]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (visibility !== "shared") return;
    if (normalizedQuery.length < 2) {
      setResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(normalizedQuery)}&limit=10`);
        const data = await response.json() as { data?: ShareUserOption[] };
        if (!response.ok || !data.data) {
          setResults([]);
          return;
        }
        setResults(data.data.filter((user) => !selectedUserSet.has(user.id)));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query, visibility, selectedUserSet]);

  function addSharedUser(user: ShareUserOption) {
    if (selectedUserSet.has(user.id)) return;
    setSharedUserIds((prev) => [...prev, user.id]);
    setSelectedSharedUsers((prev) => [...prev, user]);
    setQuery("");
    setResults([]);
  }

  function removeSharedUser(userId: string) {
    setSharedUserIds((prev) => prev.filter((id) => id !== userId));
    setSelectedSharedUsers((prev) => prev.filter((user) => user.id !== userId));
  }

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
        return existingByDay.get(index) ?? createDefaultWeekDay(index, availableDayPlans, activities);
      });
    });
  }


  async function saveInlineDay(day: WeekDayInput) {
    const titleValue = day.inlineTitle.trim();
    if (!titleValue) { setError("Day plan title is required."); return; }
    if (day.inlineItems.length < 1) { setError("Add at least one activity before saving as day plan."); return; }
    setBusy(true); setError(null);
    try {
      const response = await fetch("/api/plans/day-plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: titleValue, items: day.inlineItems.map((item, index) => ({ activityId: item.activityId, orderIndex: index, notes: item.notes || null, plannedTime: item.plannedTime || null })) }) });
      const data = await response.json() as { error?: string; data?: DayPlanOption };
      if (!response.ok || !data.data) { setError(data.error ?? "Failed to save inline day plan."); return; }
      setAvailableDayPlans((prev) => [data.data!, ...prev.filter((plan) => plan.id !== data.data!.id)]);
      setWeekDays((prev) => prev.map((entry) => entry.dayIndex !== day.dayIndex ? entry : { ...entry, mode: "attach", attachedDayPlanId: data.data!.id, inlineTitle: "", inlineItems: [createEmptyPlanItem(activities)] }));
    } catch { setError("Request failed. Please try again."); }
    finally { setBusy(false); }
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
            inlineTitle: day.mode === "inline" ? day.inlineTitle : "",
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

    const fullPayload = { ...payload, visibility, sharedUserIds: visibility === "shared" ? sharedUserIds : [] };

    try {
      const response = await fetch(planId ? `/api/plans/${planId}` : "/api/plans", {
        method: planId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload)
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
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Visibility</span>
          <select className="w-full rounded-md border px-3 py-2" value={visibility} onChange={(event) => setVisibility(event.target.value as "private" | "public" | "shared")}>
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="shared">Shared</option>
          </select>
        </label>
        {visibility === "shared" ? (
          <fieldset className="space-y-1 text-sm">
            <legend className="font-medium">Shared with users</legend>
            <label htmlFor="shared-users-search" className="font-medium">
              Search users
            </label>
            <input
              id="shared-users-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Search users by name or email"
            />
            <div className="min-h-6 text-xs text-muted-foreground">
              {query.trim().length < 2 ? "Type at least 2 characters to search users." : null}
              {query.trim().length >= 2 && !searching && results.length === 0 ? "No users found" : null}
            </div>
            <div className="max-h-40 overflow-auto rounded-md border" role="listbox" aria-label="User search results">
              {results.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="flex w-full items-start justify-between border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted"
                  onClick={() => addSharedUser(user)}
                >
                  <span className="font-medium">{user.name ?? user.email}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSharedUsers.map((user) => (
                <span key={user.id} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
                  <span>{user.name ?? user.email}</span>
                  <button type="button" aria-label={`Remove ${user.name ?? user.email}`} onClick={() => removeSharedUser(user.id)}>×</button>
                </span>
              ))}
            </div>
          </fieldset>
        ) : null}
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
                <div className="sm:col-span-2">
                  <Button type="button" variant="ghost" onClick={() => setItems((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : [createEmptyPlanItem(activities)])}>Remove activity</Button>
                </div>
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
                    {availableDayPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.title}</option>)}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <label className="space-y-1 text-sm"><span className="font-medium">Day plan title</span><input className="w-full rounded border px-2 py-1" placeholder="Например: День про осень и наблюдения" value={day.inlineTitle} onChange={(event) => updateWeekDay(day.dayIndex, { inlineTitle: event.target.value })} /></label>
                    <Button type="button" variant="outline" disabled={busy || !day.inlineTitle.trim() || day.inlineItems.length < 1} onClick={() => saveInlineDay(day)}>Save as Day Plan</Button>
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
