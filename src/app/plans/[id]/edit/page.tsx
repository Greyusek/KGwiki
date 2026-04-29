import { notFound, redirect } from "next/navigation";

import { PlanForm } from "@/components/plans/plan-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanById, listDayPlansForUser } from "@/services/plan-service";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const { id } = await params;
  const plan = await getPlanById(id, { id: session.user.id, role: session.user.role });
  if (!plan) notFound();

  const activities = await prisma.activity.findMany({
    where: session.user.role === "admin" ? {} : { OR: [{ authorId: session.user.id }, { isPublic: true }] },
    select: { id: true, title: true },
    orderBy: { title: "asc" }
  });
  const dayPlans = await listDayPlansForUser({ id: session.user.id, role: session.user.role });

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Edit plan</h1>
      <PlanForm
        planId={plan.id}
        activities={activities}
        dayPlans={dayPlans.map((entry) => ({ id: entry.id, title: entry.title }))}
        initial={{
          type: plan.type,
          title: plan.title,
          workingDays: plan.weekDays.length || 5,
          items: plan.items.map((item) => ({
            activityId: item.activityId,
            notes: item.notes ?? "",
            plannedTime: item.plannedTime ?? ""
          })),
          weekDays: plan.weekDays.map((day) => ({
            dayIndex: day.dayIndex,
            mode: day.attachedDayPlanId ? "attach" : "inline",
            attachedDayPlanId: day.attachedDayPlanId ?? dayPlans[0]?.id ?? "",
            inlineTitle: day.inlineDayPlan?.title ?? "",
            inlineItems: (day.inlineDayPlan?.items ?? [{ activityId: activities[0]?.id ?? "", plannedTime: null, notes: null, orderIndex: 0 }]).map((item) => ({
              activityId: item.activityId,
              plannedTime: item.plannedTime ?? "",
              notes: item.notes ?? ""
            }))
          }))
        }}
      />
    </section>
  );
}
