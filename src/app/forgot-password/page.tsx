import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <p className="text-sm text-muted-foreground">Enter your email to get a reset link.</p>
      <ForgotPasswordForm />
    </section>
  );
}
