import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Register</h1>
      <RegisterForm />
      <p className="text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="underline">Sign in</Link>.
      </p>
    </section>
  );
}
