"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Failed to change password.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setMessage("Password updated.");
  }

  return (
    <form className="space-y-2 rounded-lg border p-4" onSubmit={onSubmit}>
      <h2 className="font-semibold">Change password</h2>
      <input type="password" placeholder="Current password" className="w-full rounded-md border px-3 py-2 text-sm" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
      <input type="password" placeholder="New password" className="w-full rounded-md border px-3 py-2 text-sm" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      <Button size="sm" type="submit">Update password</Button>
    </form>
  );
}
