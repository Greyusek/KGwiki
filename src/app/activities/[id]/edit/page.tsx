
import { notFound, redirect } from "next/navigation";

import { ActivityForm } from "@/components/activities/activity-form";
import { auth } from "@/lib/auth";
import { canManageActivity, getActivityById } from "@/services/activity-service";

export const dynamic = "force-dynamic";

function listToLines(items: string[]) {
  return items.join("\n");
}

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const { id } = await params;
  const activity = await getActivityById(id);

  if (!activity) {
    notFound();
  }

  const allowed = canManageActivity(
    {
      id: session.user.id,
      role: session.user.role
    },
    activity
  );

  if (!allowed) {
    redirect(`/activities/${id}`);
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit activity</h1>
      <p className="text-muted-foreground">Update your activity details and save changes.</p>
      <ActivityForm
        mode="edit"
        activityId={activity.id}
        initialValues={{
          title: activity.title,
          summary: activity.summary,
          ageGroup: activity.ageGroup,
          durationMinutes: String(activity.durationMinutes),
          goal: activity.goal,
          objectives: listToLines(activity.objectives),
          description: activity.description,
          steps: listToLines(activity.steps),
          materialsNeeded: listToLines(activity.materialsNeeded),
          category: activity.category,
          tags: activity.tags.join(", "),
          season: activity.season ?? "",
          holidayLinks: listToLines(activity.holidayLinks),
          locationType: activity.locationType,
          complexityLevel: activity.complexityLevel,
          isPublic: activity.isPublic
        }}
      />
    </section>
  );
}
