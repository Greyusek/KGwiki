import { redirect } from "next/navigation";

import { PlanForm } from "@/components/plans/plan-form";
import { auth } from "@/lib/auth";
import { listUserActivities } from "@/services/activity-service";

export default async function NewPlanPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/plans/new");
  }

  const activities = await listUserActivities(session.user.id);
  if (!activities.length) {
    return (
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Create plan</h1>
        <p className="text-sm text-muted-foreground">Create at least one activity first before making plans.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Create plan</h1>
      <PlanForm activities={activities.map((activity) => ({ id: activity.id, title: activity.title }))} />
    </section>
  );
}
