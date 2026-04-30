"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminResetPasswordForm({ userId }: { userId: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError(data.error ?? "Unable to reset password.");
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password was updated successfully.");
  }

  return (
    <form className="space-y-2 rounded-lg border p-4" onSubmit={onSubmit}>
      <h2 className="font-semibold">Reset password</h2>
      <input type="password" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
      <input type="password" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      <Button size="sm" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Set new password"}</Button>
    </form>
  );
}
