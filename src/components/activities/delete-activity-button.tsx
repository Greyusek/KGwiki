"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DeleteActivityButton({ activityId }: { activityId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm("Are you sure you want to delete this activity?");
    if (!confirmed) return;

    setError(null);
    setIsDeleting(true);

    const response = await fetch(`/api/activities/${activityId}`, {
      method: "DELETE"
    });

    const data = (await response.json()) as { error?: string };

    setIsDeleting(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to delete activity.");
      return;
    }

    router.push("/activities/mine");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "Deleting..." : "Delete activity"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
