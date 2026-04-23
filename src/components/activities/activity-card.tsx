import Link from "next/link";

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
    };
    updatedAt: Date;
  };
};

export function ActivityCard({ activity }: ActivityCardProps) {
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
      <p className="text-xs text-muted-foreground">
        By {activity.author.name} · Updated {activity.updatedAt.toLocaleDateString()}
      </p>
    </article>
  );
}
