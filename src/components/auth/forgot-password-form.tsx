"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = (await response.json()) as { error?: string; data?: { resetUrl?: string | null } };
    if (!response.ok) {
      setError(data.error ?? "Failed to request reset.");
      return;
    }
    setResultUrl(data.data?.resetUrl ?? null);
  }

  return (
    <form className="space-y-3 rounded-lg border p-4" onSubmit={onSubmit}>
      <input type="email" className="w-full rounded-md border px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {resultUrl ? <p className="text-sm">Reset link (MVP): <Link href={resultUrl} className="text-blue-600 hover:underline">{resultUrl}</Link></p> : null}
      <Button type="submit">Request reset</Button>
    </form>
  );
}
