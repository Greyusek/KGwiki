
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteActivityButton } from "@/components/activities/delete-activity-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { canManageActivity, getActivityById } from "@/services/activity-service";

export const dynamic = "force-dynamic";

function renderList(items: string[]) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Not provided.</p>;
  }

  return (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function ActivityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const sessionUser = session?.user?.id && session.user.role ? { id: session.user.id, role: session.user.role } : undefined;

  const { id } = await params;
  const activity = await getActivityById(id);

  if (!activity) {
    notFound();
  }

  const canView = Boolean(activity.isPublic || (sessionUser && canManageActivity(sessionUser, activity)) || sessionUser?.role === "admin");

  if (!canView) {
    notFound();
  }

  const canEdit = Boolean(sessionUser && canManageActivity(sessionUser, activity));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{activity.title}</h1>
          <p className="text-muted-foreground">{activity.summary}</p>
        </div>
        {canEdit ? (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/activities/${activity.id}/edit`}>Edit</Link>
            </Button>
            <DeleteActivityButton activityId={activity.id} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 rounded-lg border bg-background p-4 sm:grid-cols-2">
        <Meta label="Age group" value={activity.ageGroup} />
        <Meta label="Duration" value={`${activity.durationMinutes} minutes`} />
        <Meta label="Goal" value={activity.goal} />
        <Meta label="Category" value={activity.category} />
        <Meta label="Season" value={activity.season ?? "Not specified"} />
        <Meta label="Location type" value={activity.locationType} />
        <Meta label="Complexity" value={activity.complexityLevel} />
        <Meta label="Author" value={activity.author.name} />
        <Meta label="Visibility" value={activity.isPublic ? "Public" : "Private"} />
        <Meta label="Created" value={activity.createdAt.toLocaleString()} />
        <Meta label="Updated" value={activity.updatedAt.toLocaleString()} />
        <Meta
          label="Source activity"
          value={
            activity.sourceActivity
              ? `${activity.sourceActivity.title} (by ${activity.sourceActivity.author.name})`
              : "Original"
          }
        />
      </div>

      <Section title="Description">
        <p className="text-sm whitespace-pre-wrap">{activity.description}</p>
      </Section>

      <Section title="Objectives">{renderList(activity.objectives)}</Section>
      <Section title="Steps">{renderList(activity.steps)}</Section>
      <Section title="Materials needed">{renderList(activity.materialsNeeded)}</Section>
      <Section title="Tags">{renderList(activity.tags)}</Section>
      <Section title="Holiday links">{renderList(activity.holidayLinks)}</Section>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2 rounded-lg border bg-background p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
