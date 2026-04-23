"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";

export function ProfileForm({ initial }: { initial: { name: string; avatar: string; bio: string } }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [bio, setBio] = useState(initial.bio);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatar, bio })
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Update failed.");
      setBusy(false);
      return;
    }

    router.refresh();
    setBusy(false);
  }

  return (
    <form className="space-y-3 rounded-lg border p-4" onSubmit={onSubmit}>
      <h2 className="font-semibold">Edit profile</h2>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Name</span>
        <input className="w-full rounded-md border px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Avatar URL (optional)</span>
        <input className="w-full rounded-md border px-3 py-2" value={avatar} onChange={(event) => setAvatar(event.target.value)} />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Bio (optional)</span>
        <textarea className="w-full rounded-md border px-3 py-2" value={bio} onChange={(event) => setBio(event.target.value)} />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save profile"}</Button>
    </form>
  );
}
