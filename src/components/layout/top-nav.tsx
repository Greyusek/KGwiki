import Link from "next/link";

const routes = [
  { href: "/", label: "Home" },
  { href: "/activities", label: "Activities" },
  { href: "/plans", label: "Plans" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" }
];

export function TopNav() {
  return (
    <header className="border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          KGwiki
        </Link>
        <ul className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {routes.map((route) => (
            <li key={route.href}>
              <Link href={route.href} className="transition-colors hover:text-foreground">
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
