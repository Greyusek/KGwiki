import { notFound, redirect } from "next/navigation";

import { PlanForm } from "@/components/plans/plan-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanById } from "@/services/plan-service";

function toDateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function toDateTimeInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 16) : "";
}

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const { id } = await params;
  const plan = await getPlanById(id, { id: session.user.id, role: session.user.role });
  if (!plan) notFound();

  const activities = await prisma.activity.findMany({
    where:
      session.user.role === "admin"
        ? {}
        : { OR: [{ authorId: session.user.id }, { isPublic: true }] },
    select: { id: true, title: true },
    orderBy: { title: "asc" }
  });

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Edit plan</h1>
      <PlanForm
        planId={plan.id}
        activities={activities}
        initial={{
          type: plan.type,
          title: plan.title,
          date: toDateInput(plan.date),
          weekStartDate: toDateInput(plan.weekStartDate),
          items: plan.items.map((item) => ({
            activityId: item.activityId,
            orderIndex: item.orderIndex,
            notes: item.notes ?? "",
            plannedTime: toDateTimeInput(item.plannedTime)
          }))
        }}
      />
    </section>
  );
}
