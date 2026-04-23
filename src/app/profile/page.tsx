import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="rounded-lg border bg-background p-4">
        <p>
          <span className="font-medium">Name:</span> {session.user.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {session.user.email}
        </p>
        <p>
          <span className="font-medium">Role:</span> {session?.user?.role ?? "user"}
        </p>
      </div>
    </section>
  );
}
