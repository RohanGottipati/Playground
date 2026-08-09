"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/components/layout/NavBar";
import { SiteBackground } from "@/components/layout/SiteBackground";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const phoneCapture = pathname.startsWith("/capture/");

  if (phoneCapture) {
    return <main className="min-h-dvh">{children}</main>;
  }

  return (
    <>
      <SiteBackground />
      <NavBar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-24">
        {children}
      </main>
    </>
  );
}
