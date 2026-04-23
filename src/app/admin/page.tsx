import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/profile");
  }

  const [users, activities, plans, comments] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.activity.findMany({ select: { id: true, title: true, author: { select: { name: true } }, isPublic: true }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.plan.findMany({ select: { id: true, title: true, type: true, author: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.comment.findMany({ select: { id: true, content: true, author: { select: { name: true } }, activity: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <AdminTable title="Users" headers={["Name", "Email", "Role"]} rows={users.map((user) => [user.name, user.email, user.role])} />
      <AdminTable title="Activities" headers={["Title", "Author", "Public"]} rows={activities.map((activity) => [activity.title, activity.author.name, activity.isPublic ? "Yes" : "No"])} />
      <AdminTable title="Plans" headers={["Title", "Type", "Owner"]} rows={plans.map((plan) => [plan.title, plan.type, plan.author.name])} />
      <AdminTable title="Comments" headers={["Comment", "Author", "Activity"]} rows={comments.map((comment) => [comment.content, comment.author.name, comment.activity.title])} />
    </section>
  );
}

function AdminTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <section className="space-y-2 rounded-lg border p-4">
      <h2 className="font-semibold">{title}</h2>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header} className="border-b px-2 py-1">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`} className="border-b px-2 py-1">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No data.</p>
      )}
    </section>
  );
}
