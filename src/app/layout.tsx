import type { Metadata } from "next";

import "./globals.css";

import { TopNav } from "@/components/layout/top-nav";

export const metadata: Metadata = {
  title: "KGwiki",
  description: "Activity and planning platform foundation"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-muted/30">
          <TopNav />
          <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
