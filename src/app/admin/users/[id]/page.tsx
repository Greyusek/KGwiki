import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminResetPasswordForm } from "@/components/admin/admin-reset-password-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/profile");

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true } });
  if (!user) notFound();

  return (
    <section className="space-y-4">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Back to admin</Link>
      <h1 className="text-2xl font-semibold">User details</h1>
      <div className="rounded-lg border p-4 text-sm">
        <p><span className="font-medium">Name:</span> {user.name}</p>
        <p><span className="font-medium">Email:</span> {user.email}</p>
        <p><span className="font-medium">Role:</span> {user.role}</p>
      </div>
      <AdminResetPasswordForm userId={user.id} />
    </section>
  );
}
