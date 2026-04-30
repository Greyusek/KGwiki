import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DeletePlanButton } from "@/components/plans/delete-plan-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { canEditPlan, getPlanById } from "@/services/plan-service";

export default async function PlanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const { id } = await params;
  const plan = await getPlanById(id, { id: session.user.id, role: session.user.role });
  if (!plan) notFound();
  const canEdit = canEditPlan(plan.authorId, { id: session.user.id, role: session.user.role });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{plan.title}</h1>
          <p className="text-sm text-muted-foreground">{plan.type} plan · author: {plan.author.name}</p>
        </div>
        {canEdit ? <div className="flex gap-2"><Button asChild variant="outline"><Link href={`/plans/${plan.id}/edit`}>Edit</Link></Button><DeletePlanButton id={plan.id} /></div> : null}
      </div>

      {plan.type === "day" ? (
        <>
        <ul className="space-y-3">
          {plan.items.map((item) => (
            <li key={item.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">
                <Link href={`/activities/${item.activity.id}`} className="text-blue-600 hover:underline">{item.activity.title}</Link>
              </p>
              <p className="text-muted-foreground">{item.activity.summary} · {item.activity.category} · {item.activity.ageGroup}</p>
              {item.plannedTime ? <p>Planned: {item.plannedTime}</p> : null}
              {item.notes ? <p>Notes: {item.notes}</p> : null}
            </li>
          ))}
        </ul>
      </>
      ) : (
        <div className="space-y-3">
          {plan.weekDays.map((day) => {
            const sourceDay = day.attachedDayPlan ?? day.inlineDayPlan;
            return (
              <section key={day.id} className="rounded-md border p-3">
                <h2 className="font-semibold">Day {day.dayIndex + 1}</h2>
                {sourceDay ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {day.attachedDayPlan ? <>Linked day plan: <Link href={`/plans/${day.attachedDayPlan.id}`} className="text-blue-600 hover:underline">{day.attachedDayPlan.title}</Link></> : <>Inline day plan: {sourceDay.title}</>}
                    </p>
                    <ul className="mt-2 space-y-2 text-sm">
                      {sourceDay.items.map((item) => (
                        <li key={item.id}>
                          {item.plannedTime ? `${item.plannedTime} · ` : ""}
                          <Link href={`/activities/${item.activity.id}`} className="text-blue-600 hover:underline">{item.activity.title}</Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No day plan selected.</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
