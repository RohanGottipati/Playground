"use client";

import { usePathname } from "next/navigation";
import { NavPill } from "@/components/layout/NavPill";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { CustomCursor } from "@/components/ui/CustomCursor";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const phoneCapture = pathname.startsWith("/capture/");

  if (phoneCapture) {
    return <main className="min-h-dvh">{children}</main>;
  }

  return (
    <>
      <CustomCursor />

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <BackgroundVideo
          src="/playground-bg.mp4"
          poster="/playground-bg-poster.jpg"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/40" />
      </div>

      <div className="fixed inset-x-0 top-4 z-20 flex justify-center px-4">
        <NavPill />
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-24">
        {children}
      </main>
    </>
  );
}
