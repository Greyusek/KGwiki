"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { Button } from "@/components/ui/button";

export function AdminResetPasswordForm({ userId }: { userId: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword, confirmPassword })
    });
    const data = (await response.json()) as { error?: string };
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? t("admin.reset.error"));
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setMessage(t("admin.reset.success"));
  }

  return (
    <form className="space-y-2 rounded-lg border p-4" onSubmit={onSubmit}>
      <h2 className="font-semibold">{t("admin.reset.title")}</h2>
      <input type="password" className="w-full rounded-md border px-3 py-2 text-sm" placeholder={t("auth.newPassword")} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
      <input type="password" className="w-full rounded-md border px-3 py-2 text-sm" placeholder={t("auth.confirmPassword")} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      <Button size="sm" type="submit" disabled={isSubmitting}>{isSubmitting ? t("button.saving") : t("admin.reset.submit")}</Button>
    </form>
  );
}
