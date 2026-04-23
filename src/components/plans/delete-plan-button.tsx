"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DeletePlanButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={async () => {
        const response = await fetch(`/api/plans/${id}`, { method: "DELETE" });
        if (response.ok) {
          router.push("/plans");
          router.refresh();
        }
      }}
    >
      Delete
    </Button>
  );
}
