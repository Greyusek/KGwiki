import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { listPlans } from "@/services/plan-service";

export default async function PlansPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string; q?: string; page?: string; pageSize?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    redirect("/login?callbackUrl=/plans");
  }

  const params = await searchParams;
  const type = params.type === "day" || params.type === "week" ? params.type : undefined;
  const q = params.q ?? "";
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const pageSize = [5, 10, 15].includes(Number(params.pageSize)) ? Number(params.pageSize) : 10;
  const { items: plans, total } = await listPlans({ id: session.user.id, role: session.user.role }, { type, q, page, pageSize });
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const buildHref = (next: Record<string, string>) => {
    const query = new URLSearchParams();
    if (type) query.set("type", type);
    if (q) query.set("q", q);
    query.set("pageSize", String(pageSize));
    for (const [key, value] of Object.entries(next)) query.set(key, value);
    return `/plans?${query.toString()}`;
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Plans</h1>
        <Button asChild><Link href="/plans/new">New plan</Link></Button>
      </div>

      <form className="grid gap-2 rounded-lg border p-3 sm:grid-cols-4">
        <input name="q" defaultValue={q} placeholder="Search by title" className="rounded border px-2 py-1 text-sm" />
        <select name="type" defaultValue={type ?? ""} className="rounded border px-2 py-1 text-sm">
          <option value="">All types</option>
          <option value="day">Day plans</option>
          <option value="week">Week plans</option>
        </select>
        <select name="pageSize" defaultValue={String(pageSize)} className="rounded border px-2 py-1 text-sm">
          {[5, 10, 15].map((size) => <option key={size} value={size}>{size} / page</option>)}
        </select>
        <button className="rounded bg-black px-2 py-1 text-sm text-white">Apply</button>
      </form>

      {plans.length ? (
        <ul className="space-y-3">
          {plans.map((plan) => (
            <li key={plan.id} className="rounded-lg border p-4">
              <Link href={`/plans/${plan.id}`} className="font-medium text-blue-600 hover:underline">{plan.title}</Link>
              <p className="text-sm text-muted-foreground">
                {plan.type === "day" ? "Day plan" : "Week plan"} · Author: {plan.author.name} ·
                {plan.type === "day" ? ` Date: ${plan.date?.toLocaleDateString() ?? "-"} · Activities: ${plan.items.length}` : ` Week start: ${plan.weekStartDate?.toLocaleDateString() ?? "-"} · Days: ${plan.weekDays.length}`}
              </p>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted-foreground">No plans found.</p>}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Page {page} of {totalPages} ({total} total)</p>
        <div className="flex gap-2">
          {page > 1 ? <Link className="rounded border px-2 py-1" href={buildHref({ page: String(page - 1) })}>Previous</Link> : null}
          {page < totalPages ? <Link className="rounded border px-2 py-1" href={buildHref({ page: String(page + 1) })}>Next</Link> : null}
        </div>
      </div>
    </section>
  );
}
