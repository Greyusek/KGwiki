import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      activities: {
        select: { id: true, title: true, sourceActivityId: true },
        orderBy: { updatedAt: "desc" }
      },
      plans: {
        select: { id: true, title: true, type: true, updatedAt: true },
        orderBy: { updatedAt: "desc" }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const originalActivities = user.activities.filter((activity) => !activity.sourceActivityId);
  const adaptedActivities = user.activities.filter((activity) => Boolean(activity.sourceActivityId));

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="rounded-lg border bg-background p-4 text-sm">
        <p><span className="font-medium">Name:</span> {user.name}</p>
        <p><span className="font-medium">Email:</span> {user.email}</p>
        <p><span className="font-medium">Role:</span> {user.role}</p>
        {user.bio ? <p><span className="font-medium">Bio:</span> {user.bio}</p> : <p className="text-muted-foreground">Bio not set.</p>}
      </div>

      <ProfileForm initial={{ name: user.name, avatar: user.avatar ?? "", bio: user.bio ?? "" }} />

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold">My activities</h2>
        {originalActivities.length ? <ul className="mt-2 list-disc pl-5 text-sm">
          {originalActivities.map((activity) => (
            <li key={activity.id}><Link className="text-blue-600 hover:underline" href={`/activities/${activity.id}`}>{activity.title}</Link></li>
          ))}
        </ul> : <p className="mt-2 text-sm text-muted-foreground">No authored activities yet.</p>}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold">Adapted activities</h2>
        {adaptedActivities.length ? <ul className="mt-2 list-disc pl-5 text-sm">
          {adaptedActivities.map((activity) => (
            <li key={activity.id}><Link className="text-blue-600 hover:underline" href={`/activities/${activity.id}`}>{activity.title}</Link></li>
          ))}
        </ul> : <p className="mt-2 text-sm text-muted-foreground">No adapted activities yet.</p>}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold">My plans</h2>
        {user.plans.length ? <ul className="mt-2 list-disc pl-5 text-sm">
          {user.plans.map((plan) => (
            <li key={plan.id}><Link className="text-blue-600 hover:underline" href={`/plans/${plan.id}`}>{plan.title}</Link> ({plan.type})</li>
          ))}
        </ul> : <p className="mt-2 text-sm text-muted-foreground">No plans yet.</p>}
      </section>
    </section>
  );
}
