import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { listPlans } from "@/services/plan-service";

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    redirect("/login?callbackUrl=/plans");
  }

  const { type } = await searchParams;
  const plans = await listPlans({ id: session.user.id, role: session.user.role });
  const filteredPlans = type === "day" || type === "week" ? plans.filter((plan) => plan.type === type) : plans;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Plans</h1>
        <div className="flex gap-2">
          <Button asChild variant={type ? "outline" : "default"}><Link href="/plans">All</Link></Button>
          <Button asChild variant={type === "day" ? "default" : "outline"}><Link href="/plans?type=day">Day</Link></Button>
          <Button asChild variant={type === "week" ? "default" : "outline"}><Link href="/plans?type=week">Week</Link></Button>
          <Button asChild><Link href="/plans/new">New plan</Link></Button>
        </div>
      </div>
      {filteredPlans.length ? (
        <ul className="space-y-3">
          {filteredPlans.map((plan) => (
            <li key={plan.id} className="rounded-lg border p-4">
              <Link href={`/plans/${plan.id}`} className="font-medium text-blue-600 hover:underline">
                {plan.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {plan.type} · {plan.items.length} items · updated {plan.updatedAt.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No plans match the selected filter.</p>
      )}
    </section>
  );
}
