import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/profile");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-muted-foreground">Admin-only area for user and platform management.</p>
    </section>
  );
}
