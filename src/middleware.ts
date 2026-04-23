import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default auth((request) => {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const role = request.auth?.user?.role;

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"]
};
