"use client";

import { usePathname } from "next/navigation";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";

// On the landing page the video only fills the right 60% of the viewport
// (the left 40% is a plain white panel rendered by the page itself), so the
// video element itself is sized down instead of just being covered up.
export function SiteBackground() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      className={`fixed right-0 -z-10 overflow-hidden ${
        isHome
          ? "inset-y-4 right-4 w-[calc(100%-2rem)] rounded-3xl sm:w-[calc(60%-1.5rem)]"
          : "inset-y-0 left-0 w-full"
      }`}
    >
      <BackgroundVideo
        src="/playground-bg.mp4"
        poster="/playground-bg-poster.jpg"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/40" />
    </div>
  );
}
