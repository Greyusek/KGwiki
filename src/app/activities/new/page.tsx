import { redirect } from "next/navigation";

import { ActivityForm } from "@/components/activities/activity-form";
import { auth } from "@/lib/auth";

export default async function NewActivityPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/activities/new");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Create activity</h1>
      <p className="text-muted-foreground">Fill in the details below to publish or save your activity.</p>
      <ActivityForm mode="create" />
    </section>
  );
}
