
import { ActivityCard } from "@/components/activities/activity-card";
import {
  AGE_GROUP_OPTIONS,
  CATEGORY_OPTIONS,
  COMPLEXITY_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  PAGE_SIZE_OPTIONS,
  SEASON_OPTIONS
} from "@/lib/activity-options";
import { listActivitiesWithFilters } from "@/services/activity-service";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(params.pageSize) as 10 | 20 | 30)
    ? Number(params.pageSize)
    : 10;
  const { items: activities, total } = await listActivitiesWithFilters({
    visibility: "public",
    page,
    pageSize,
    search: params.q,
    ageGroup: params.ageGroup,
    category: params.category,
    season: params.season,
    locationType: params.locationType,
    complexityLevel: params.complexity,
    durationMin: params.durationMin ? Number(params.durationMin) : undefined,
    durationMax: params.durationMax ? Number(params.durationMax) : undefined
  });
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const queryEntries = Object.entries(params).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0
  );
  const query = new URLSearchParams(queryEntries);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Public activities</h1>
        <p className="text-muted-foreground">Browse activities shared by the community.</p>
      </div>
      <form className="grid gap-2 rounded-lg border bg-background p-3 md:grid-cols-4">
        <input name="q" placeholder="Search title/summary..." defaultValue={params.q ?? ""} className="rounded border px-2 py-1 text-sm" />
        <select name="ageGroup" defaultValue={params.ageGroup ?? ""} className="rounded border px-2 py-1 text-sm"><option value="">All age groups</option>{AGE_GROUP_OPTIONS.map((v)=><option key={v} value={v}>{v}</option>)}</select>
        <select name="category" defaultValue={params.category ?? ""} className="rounded border px-2 py-1 text-sm"><option value="">All categories</option>{CATEGORY_OPTIONS.map((v)=><option key={v} value={v}>{v}</option>)}</select>
        <select name="season" defaultValue={params.season ?? ""} className="rounded border px-2 py-1 text-sm"><option value="">All seasons</option>{SEASON_OPTIONS.map((v)=><option key={v} value={v}>{v}</option>)}</select>
        <select name="locationType" defaultValue={params.locationType ?? ""} className="rounded border px-2 py-1 text-sm"><option value="">All locations</option>{LOCATION_TYPE_OPTIONS.map((v)=><option key={v} value={v}>{v}</option>)}</select>
        <select name="complexity" defaultValue={params.complexity ?? ""} className="rounded border px-2 py-1 text-sm"><option value="">All complexity</option>{COMPLEXITY_OPTIONS.map((v)=><option key={v} value={v}>{v}</option>)}</select>
        <input name="durationMin" type="number" min={5} placeholder="Min duration" defaultValue={params.durationMin ?? ""} className="rounded border px-2 py-1 text-sm" />
        <input name="durationMax" type="number" min={5} placeholder="Max duration" defaultValue={params.durationMax ?? ""} className="rounded border px-2 py-1 text-sm" />
        <select name="pageSize" defaultValue={String(pageSize)} className="rounded border px-2 py-1 text-sm">{PAGE_SIZE_OPTIONS.map((size)=><option key={size} value={size}>{size} / page</option>)}</select>
        <button className="rounded bg-black px-3 py-1 text-sm text-white">Apply</button>
      </form>

      {activities.length === 0 ? (
        <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
          No public activities yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {activities.map((activity: (typeof activities)[number]) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">Showing page {page} of {totalPages} ({total} total).</p>
        <div className="flex gap-2">
          {page > 1 ? (() => {
            const prev = new URLSearchParams(query);
            prev.set("page", String(page - 1));
            prev.set("pageSize", String(pageSize));
            return <a className="rounded border px-2 py-1" href={`/activities?${prev.toString()}`}>Previous</a>;
          })() : null}
          {page < totalPages ? (() => {
            const next = new URLSearchParams(query);
            next.set("page", String(page + 1));
            next.set("pageSize", String(pageSize));
            return <a className="rounded border px-2 py-1" href={`/activities?${next.toString()}`}>Next</a>;
          })() : null}
        </div>
      </div>
    </section>
  );
}
