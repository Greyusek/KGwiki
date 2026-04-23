import { signOut } from "@/lib/auth";

import { Button } from "@/components/ui/button";

export function LogoutForm() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        Logout
      </Button>
    </form>
  );
}
