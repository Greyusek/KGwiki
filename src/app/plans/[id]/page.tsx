import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DeletePlanButton } from "@/components/plans/delete-plan-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getPlanById } from "@/services/plan-service";

export default async function PlanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const { id } = await params;
  const plan = await getPlanById(id, { id: session.user.id, role: session.user.role });
  if (!plan) notFound();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{plan.title}</h1>
          <p className="text-sm text-muted-foreground">{plan.type} plan</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/plans/${plan.id}/edit`}>Edit</Link>
        </Button>
          <DeletePlanButton id={plan.id} />
      </div>

      <ul className="space-y-3">
        {plan.items.map((item) => (
          <li key={item.id} className="rounded-md border p-3 text-sm">
            <p className="font-medium">
              {item.orderIndex + 1}. {item.activity.title}
            </p>
            {item.plannedTime ? <p>Planned: {item.plannedTime.toLocaleString()}</p> : null}
            {item.notes ? <p>Notes: {item.notes}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
