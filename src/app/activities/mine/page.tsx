
import Link from "next/link";
import { redirect } from "next/navigation";

import { ActivityCard } from "@/components/activities/activity-card";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE_OPTIONS } from "@/lib/activity-options";
import { auth } from "@/lib/auth";
import { listActivitiesWithFilters } from "@/services/activity-service";

export const dynamic = "force-dynamic";

export default async function MyActivitiesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/activities/mine");
  }

  const params = await searchParams;
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(params.pageSize) as 10 | 20 | 30)
    ? Number(params.pageSize)
    : 10;
  const { items: activities, total } = await listActivitiesWithFilters({
    visibility: "mine",
    userId: session.user.id,
    page,
    pageSize,
    search: params.q
  });
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

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
      <form className="flex flex-wrap gap-2 rounded-lg border bg-background p-3">
        <input name="q" placeholder="Search my activities..." defaultValue={params.q ?? ""} className="rounded border px-2 py-1 text-sm" />
        <select name="pageSize" defaultValue={String(pageSize)} className="rounded border px-2 py-1 text-sm">{PAGE_SIZE_OPTIONS.map((size)=><option key={size} value={size}>{size} / page</option>)}</select>
        <button className="rounded bg-black px-3 py-1 text-sm text-white">Apply</button>
      </form>

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
      <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} total).</p>
    </section>
  );
}
