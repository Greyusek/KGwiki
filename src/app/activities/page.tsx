
import { ActivityCard } from "@/components/activities/activity-card";
import { listPublicActivities } from "@/services/activity-service";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const activities = await listPublicActivities();

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Public activities</h1>
        <p className="text-muted-foreground">Browse activities shared by the community.</p>
      </div>

      {activities.length === 0 ? (
        <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
          No public activities yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {activities.map((activity: (typeof activities)[number]) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </section>
  );
}
