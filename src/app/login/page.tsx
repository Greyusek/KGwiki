import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      {params.registered === "1" ? (
        <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
          Registration successful. Please sign in.
        </p>
      ) : null}
      <LoginForm />
      <p className="text-sm text-muted-foreground">
        New here? <Link href="/register" className="underline">Create an account</Link>.
      </p>
    </section>
  );
}
