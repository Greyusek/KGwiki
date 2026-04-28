import { redirect } from "next/navigation";

import { PlanForm } from "@/components/plans/plan-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listDayPlansForUser } from "@/services/plan-service";

export default async function NewPlanPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    redirect("/login?callbackUrl=/plans/new");
  }

  const activities = await prisma.activity.findMany({
    where: { OR: [{ authorId: session.user.id }, { isPublic: true }] },
    select: { id: true, title: true },
    orderBy: { title: "asc" }
  });
  const dayPlans = await listDayPlansForUser({ id: session.user.id, role: session.user.role });

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
      <PlanForm activities={activities} dayPlans={dayPlans.map((plan) => ({ id: plan.id, title: plan.title }))} />
    </section>
  );
}
