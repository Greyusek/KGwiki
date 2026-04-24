import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <section className="mx-auto max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-red-600">Missing reset token. Request a new link.</p>
      )}
    </section>
  );
}
