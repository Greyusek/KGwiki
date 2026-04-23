
import Link from "next/link";
import { redirect } from "next/navigation";

import { ActivityCard } from "@/components/activities/activity-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { listUserActivities } from "@/services/activity-service";

export const dynamic = "force-dynamic";

export default async function MyActivitiesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/activities/mine");
  }

  const activities = await listUserActivities(session.user.id);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My activities</h1>
          <p className="text-muted-foreground">Create and manage activities you authored.</p>
        </div>
        <Button asChild>
          <Link href="/activities/new">New activity</Link>
        </Button>
      </div>

      {activities.length === 0 ? (
        <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
          You have not created any activities yet.
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
