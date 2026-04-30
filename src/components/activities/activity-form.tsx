"use client";

import { FormEvent, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/layout/language-provider";
import { Button } from "@/components/ui/button";
import {
  AGE_GROUP_OPTIONS,
  CATEGORY_OPTIONS,
  COMPLEXITY_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  SEASON_OPTIONS
} from "@/lib/activity-options";
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
  const [success, setSuccess] = useState<string | null>(null);
  const { t } = useLanguage();

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
      setError(parsed.error.issues[0]?.message ?? t("message.validation.checkFields"));
      return;
    }

    setSuccess(null);
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
      setError(data.error ?? t("message.error.generic"));
      return;
    }

    const id = data.data?.id;
    if (!id) {
      setError(t("message.error.generic"));
      return;
    }

    setSuccess(t("message.success.saved"));
    router.push(`/activities/${id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-background p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("activity.form.title")} required helpText={t("activity.form.titleHelp")}>
          <input className="w-full rounded-md border px-3 py-2 text-sm" minLength={3} value={values.title} onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))} required />
        </Field>
        <Field label={t("activity.form.ageGroup")} required helpText={t("activity.form.ageGroupHelp")}>
          <select className="w-full rounded-md border px-3 py-2 text-sm" value={values.ageGroup} onChange={(event) => setValues((prev) => ({ ...prev, ageGroup: event.target.value }))} required>
            <option value="" disabled>{t("activity.form.ageGroupPlaceholder")}</option>
            {AGE_GROUP_OPTIONS.map((ageGroup) => <option key={ageGroup} value={ageGroup}>{ageGroup}</option>)}
          </select>
        </Field>
      </div>

      <Field label={t("activity.form.summary")} required helpText={t("activity.form.summaryHelp")}>
        <textarea className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" minLength={10} value={values.summary} onChange={(event) => setValues((prev) => ({ ...prev, summary: event.target.value }))} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("activity.form.duration")} required helpText={t("activity.form.durationHelp")}>
          <input type="number" min={5} max={1440} className="w-full rounded-md border px-3 py-2 text-sm" value={values.durationMinutes} onChange={(event) => setValues((prev) => ({ ...prev, durationMinutes: event.target.value }))} required />
        </Field>
        <Field label={t("activity.form.category")} required helpText={t("activity.form.categoryHelp")}>
          <select className="w-full rounded-md border px-3 py-2 text-sm" value={values.category} onChange={(event) => setValues((prev) => ({ ...prev, category: event.target.value }))} required>
            <option value="" disabled>{t("activity.form.categoryPlaceholder")}</option>
            {CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("activity.form.locationType")} required helpText={t("activity.form.locationTypeHelp")}>
          <select className="w-full rounded-md border px-3 py-2 text-sm" value={values.locationType} onChange={(event) => setValues((prev) => ({ ...prev, locationType: event.target.value }))} required>
            <option value="" disabled>{t("activity.form.locationTypePlaceholder")}</option>
            {LOCATION_TYPE_OPTIONS.map((locationType) => <option key={locationType} value={locationType}>{locationType}</option>)}
          </select>
        </Field>
        <Field label={t("activity.form.complexityLevel")} required helpText={t("activity.form.complexityHelp")}>
          <select className="w-full rounded-md border px-3 py-2 text-sm" value={values.complexityLevel} onChange={(event) => setValues((prev) => ({ ...prev, complexityLevel: event.target.value }))} required>
            <option value="" disabled>{t("activity.form.complexityPlaceholder")}</option>
            {COMPLEXITY_OPTIONS.map((complexityLevel) => <option key={complexityLevel} value={complexityLevel}>{complexityLevel}</option>)}
          </select>
        </Field>
      </div>

      <Field label={t("activity.form.goal")} required helpText={t("activity.form.goalHelp")}>
        <textarea className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" minLength={10} value={values.goal} onChange={(event) => setValues((prev) => ({ ...prev, goal: event.target.value }))} required />
      </Field>

      <Field label={t("activity.form.contextSetup")} required helpText={t("activity.form.contextSetupHelp")}>
        <textarea className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" minLength={20} value={values.description} onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))} required />
      </Field>

      <Field label={t("activity.form.objectives")} helpText={t("activity.form.objectivesHelp")}>
        <textarea className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" value={values.objectives} onChange={(event) => setValues((prev) => ({ ...prev, objectives: event.target.value }))} />
      </Field>

      <Field label={t("activity.form.steps")} helpText={t("activity.form.stepsHelp")}>
        <textarea className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" value={values.steps} onChange={(event) => setValues((prev) => ({ ...prev, steps: event.target.value }))} />
      </Field>

      <Field label={t("activity.form.materials")} helpText={t("activity.form.materialsHelp")}>
        <textarea className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" value={values.materialsNeeded} onChange={(event) => setValues((prev) => ({ ...prev, materialsNeeded: event.target.value }))} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("activity.form.tags")} helpText={t("activity.form.tagsHelp")}>
          <input className="w-full rounded-md border px-3 py-2 text-sm" value={values.tags} onChange={(event) => setValues((prev) => ({ ...prev, tags: event.target.value }))} />
        </Field>
        <Field label={t("activity.form.season")}>
          <select className="w-full rounded-md border px-3 py-2 text-sm" value={values.season} onChange={(event) => setValues((prev) => ({ ...prev, season: event.target.value }))}>
            <option value="">{t("activity.form.seasonPlaceholder")}</option>
            {SEASON_OPTIONS.map((season) => <option key={season} value={season}>{season}</option>)}
          </select>
        </Field>
      </div>

      <Field label={t("activity.form.holidayLinks")}>
        <textarea className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" value={values.holidayLinks} onChange={(event) => setValues((prev) => ({ ...prev, holidayLinks: event.target.value }))} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.isPublic} onChange={(event) => setValues((prev) => ({ ...prev, isPublic: event.target.checked }))} />
        {t("activity.form.public")}
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("button.saving") : mode === "create" ? t("activity.form.addActivity") : t("button.save")}
      </Button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
  helpText
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  helpText?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </p>
      {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}
      {children}
    </div>
  );
}
