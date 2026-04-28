import Link from "next/link";

import { AddToDayPlanButton } from "@/components/plans/add-to-day-plan-button";

type ActivityCardProps = {
  activity: {
    id: string;
    title: string;
    summary: string;
    category: string;
    ageGroup: string;
    durationMinutes: number;
    complexityLevel: string;
    isPublic: boolean;
    author: {
      name: string;
      avatar?: string | null;
      bio?: string | null;
    };
    updatedAt: Date;
  };
  canAddToPlan?: boolean;
};

export function ActivityCard({ activity, canAddToPlan = false }: ActivityCardProps) {
  return (
    <article className="space-y-3 rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">
          <Link href={`/activities/${activity.id}`} className="hover:underline">
            {activity.title}
          </Link>
        </h3>
        <span className="rounded-full border px-2 py-0.5 text-xs">
          {activity.isPublic ? "Public" : "Private"}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{activity.summary}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="font-medium">Category</dt>
          <dd>{activity.category}</dd>
        </div>
        <div>
          <dt className="font-medium">Age group</dt>
          <dd>{activity.ageGroup}</dd>
        </div>
        <div>
          <dt className="font-medium">Duration</dt>
          <dd>{activity.durationMinutes} min</dd>
        </div>
        <div>
          <dt className="font-medium">Complexity</dt>
          <dd>{activity.complexityLevel}</dd>
        </div>
      </dl>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {activity.author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activity.author.avatar} alt={activity.author.name} className="h-6 w-6 rounded-full object-cover" title={activity.author.bio ?? "Bio not provided."} />
          ) : (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px]" title={activity.author.bio ?? "Bio not provided."}>
              {activity.author.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span title={activity.author.bio ?? "Bio not provided."}>
            By {activity.author.name} · Updated {activity.updatedAt.toLocaleDateString()}
          </span>
        </div>
        {canAddToPlan ? <AddToDayPlanButton activityId={activity.id} /> : null}
      </div>
    </article>
  );
}
