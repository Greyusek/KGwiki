import Link from "next/link";

import { LogoutForm } from "@/components/auth/logout-form";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NavLabel } from "@/components/layout/nav-label";
import { auth } from "@/lib/auth";

const publicRoutes = [
  { href: "/", key: "nav.home" },
  { href: "/activities", key: "nav.activities" },
  { href: "/plans", key: "nav.plans" }
];

export async function TopNav() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

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
                <NavLabel tKey={route.key} />
              </Link>
            </li>
          ))}

          {session?.user ? (
            <>
              <li>
                <Link href="/activities/mine" className="transition-colors hover:text-foreground">
                  <NavLabel tKey="nav.myActivities" />
                </Link>
              </li>
              <li>
                <Link href="/profile" className="transition-colors hover:text-foreground">
                  <NavLabel tKey="nav.profile" />
                </Link>
              </li>
              {isAdmin ? (
                <li>
                  <Link href="/admin" className="transition-colors hover:text-foreground">
                    <NavLabel tKey="nav.admin" />
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
                  <NavLabel tKey="nav.login" />
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-foreground">
                  <NavLabel tKey="nav.register" />
                </Link>
              </li>
            </>
          )}
          <li>
            <LanguageSwitcher />
          </li>
        </ul>
      </nav>
    </header>
  );
}
