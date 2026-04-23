"use client";

import { FormEvent, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { activityInputSchema } from "@/lib/validators/activity";

type ActivityFormValues = {
  title: string;
  summary: string;
  ageGroup: string;
  durationMinutes: string;
  goal: string;
  objectives: string;
  description: string;
  steps: string;
  materialsNeeded: string;
  category: string;
  tags: string;
  season: string;
  holidayLinks: string;
  locationType: string;
  complexityLevel: string;
  isPublic: boolean;
};

type ActivityFormProps = {
  mode: "create" | "edit";
  activityId?: string;
  initialValues?: Partial<ActivityFormValues>;
};

const DEFAULT_VALUES: ActivityFormValues = {
  title: "",
  summary: "",
  ageGroup: "",
  durationMinutes: "30",
  goal: "",
  objectives: "",
  description: "",
  steps: "",
  materialsNeeded: "",
  category: "",
  tags: "",
  season: "",
  holidayLinks: "",
  locationType: "",
  complexityLevel: "",
  isPublic: false
};

function parseListByLine(raw: string) {
  return raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseListByComma(raw: string) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ActivityForm({ mode, activityId, initialValues }: ActivityFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ActivityFormValues>({ ...DEFAULT_VALUES, ...initialValues });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const endpoint = useMemo(() => {
    return mode === "create" ? "/api/activities" : `/api/activities/${activityId}`;
  }, [activityId, mode]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      title: values.title,
      summary: values.summary,
      ageGroup: values.ageGroup,
      durationMinutes: Number(values.durationMinutes),
      goal: values.goal,
      objectives: parseListByLine(values.objectives),
      description: values.description,
      steps: parseListByLine(values.steps),
      materialsNeeded: parseListByLine(values.materialsNeeded),
      category: values.category,
      tags: parseListByComma(values.tags),
      season: values.season,
      holidayLinks: parseListByLine(values.holidayLinks),
      locationType: values.locationType,
      complexityLevel: values.complexityLevel,
      isPublic: values.isPublic
    };

    const parsed = activityInputSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form fields.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsed.data)
    });

    const data = (await response.json()) as { error?: string; data?: { id: string } };

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Something went wrong while saving this activity.");
      return;
    }

    const id = data.data?.id;
    if (!id) {
      setError("Activity saved, but redirect failed.");
      return;
    }

    router.push(`/activities/${id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-background p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required>
          <input className="w-full rounded-md border px-3 py-2 text-sm" value={values.title} onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))} required />
        </Field>
        <Field label="Age group" required>
          <input className="w-full rounded-md border px-3 py-2 text-sm" value={values.ageGroup} onChange={(event) => setValues((prev) => ({ ...prev, ageGroup: event.target.value }))} required />
        </Field>
      </div>

      <Field label="Summary" required>
        <textarea className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" value={values.summary} onChange={(event) => setValues((prev) => ({ ...prev, summary: event.target.value }))} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Duration (minutes)" required>
          <input type="number" min={5} max={1440} className="w-full rounded-md border px-3 py-2 text-sm" value={values.durationMinutes} onChange={(event) => setValues((prev) => ({ ...prev, durationMinutes: event.target.value }))} required />
        </Field>
        <Field label="Category" required>
          <input className="w-full rounded-md border px-3 py-2 text-sm" value={values.category} onChange={(event) => setValues((prev) => ({ ...prev, category: event.target.value }))} required />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location type" required>
          <input className="w-full rounded-md border px-3 py-2 text-sm" value={values.locationType} onChange={(event) => setValues((prev) => ({ ...prev, locationType: event.target.value }))} required />
        </Field>
        <Field label="Complexity level" required>
          <input className="w-full rounded-md border px-3 py-2 text-sm" value={values.complexityLevel} onChange={(event) => setValues((prev) => ({ ...prev, complexityLevel: event.target.value }))} required />
        </Field>
      </div>

      <Field label="Goal" required>
        <textarea className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" value={values.goal} onChange={(event) => setValues((prev) => ({ ...prev, goal: event.target.value }))} required />
      </Field>

      <Field label="Description" required>
        <textarea className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" value={values.description} onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))} required />
      </Field>

      <Field label="Objectives (one per line)">
        <textarea className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" value={values.objectives} onChange={(event) => setValues((prev) => ({ ...prev, objectives: event.target.value }))} />
      </Field>

      <Field label="Steps (one per line)">
        <textarea className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" value={values.steps} onChange={(event) => setValues((prev) => ({ ...prev, steps: event.target.value }))} />
      </Field>

      <Field label="Materials needed (one per line)">
        <textarea className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" value={values.materialsNeeded} onChange={(event) => setValues((prev) => ({ ...prev, materialsNeeded: event.target.value }))} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tags (comma separated)">
          <input className="w-full rounded-md border px-3 py-2 text-sm" value={values.tags} onChange={(event) => setValues((prev) => ({ ...prev, tags: event.target.value }))} />
        </Field>
        <Field label="Season">
          <input className="w-full rounded-md border px-3 py-2 text-sm" value={values.season} onChange={(event) => setValues((prev) => ({ ...prev, season: event.target.value }))} />
        </Field>
      </div>

      <Field label="Holiday links (one per line)">
        <textarea className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" value={values.holidayLinks} onChange={(event) => setValues((prev) => ({ ...prev, holidayLinks: event.target.value }))} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.isPublic} onChange={(event) => setValues((prev) => ({ ...prev, isPublic: event.target.checked }))} />
        Make this activity visible in the public catalog
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : mode === "create" ? "Create activity" : "Save changes"}
      </Button>
    </form>
  );
}

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </p>
      {children}
    </div>
  );
}
