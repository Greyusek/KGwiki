import { redirect } from "next/navigation";

import { PlanForm } from "@/components/plans/plan-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NewPlanPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/plans/new");
  }

  const activities = await prisma.activity.findMany({
    where: { OR: [{ authorId: session.user.id }, { isPublic: true }] },
    select: { id: true, title: true },
    orderBy: { title: "asc" }
  });
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
