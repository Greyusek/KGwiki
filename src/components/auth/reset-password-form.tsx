"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Reset failed.");
      return;
    }
    router.push("/login");
  }

  return (
    <form className="space-y-3 rounded-lg border p-4" onSubmit={onSubmit}>
      <input type="password" placeholder="New password" className="w-full rounded-md border px-3 py-2 text-sm" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit">Set new password</Button>
    </form>
  );
}
