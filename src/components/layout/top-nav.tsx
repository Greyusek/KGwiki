import Link from "next/link";

import { LogoutForm } from "@/components/auth/logout-form";
import { auth } from "@/lib/auth";

const publicRoutes = [
  { href: "/", label: "Home" },
  { href: "/activities", label: "Activities" },
  { href: "/plans", label: "Plans" }
];

export async function TopNav() {
  const session = await auth();
  const isAdmin = session?.user.role === "admin";

  return (
    <header className="border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex min-h-14 max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="text-lg font-semibold text-primary">
          KGwiki
        </Link>
        <ul className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {publicRoutes.map((route) => (
            <li key={route.href}>
              <Link href={route.href} className="transition-colors hover:text-foreground">
                {route.label}
              </Link>
            </li>
          ))}

          {session?.user ? (
            <>
              <li>
                <Link href="/profile" className="transition-colors hover:text-foreground">
                  Profile
                </Link>
              </li>
              {isAdmin ? (
                <li>
                  <Link href="/admin" className="transition-colors hover:text-foreground">
                    Admin
                  </Link>
                </li>
              ) : null}
              <li>
                <LogoutForm />
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-foreground">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
