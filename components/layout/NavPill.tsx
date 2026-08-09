"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/playground", label: "Playground" },
  { href: "/stats", label: "Stats" },
  { href: "/create", label: "Make a game" },
];

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9.5a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1V16a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3.5a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V10" />
    </svg>
  );
}

function JoystickIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="6" r="2.5" />
      <path d="M12 8.5V14" />
      <rect x="4" y="14" width="16" height="6" rx="2.5" />
      <path d="M8.5 17h.01M15.5 15.5l1 1M15.5 18.5l1-1" />
    </svg>
  );
}

// Every route that renders this nav sits on top of an opaque light panel
// (the video background is only ever visible behind the landing page, which
// never shows the nav), so the pill can stay on a single light color scheme.
export function NavPill() {
  const pathname = usePathname();
  const isGamePage = pathname?.startsWith("/game/") ?? false;

  const circleBase =
    "flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur-xl backdrop-saturate-150 transition-colors duration-150";
  const circleIdle =
    "border border-ink/15 bg-white/80 text-ink/60 hover:border-ink/30 hover:text-ink";
  const circleActive = "border border-ink bg-ink text-white";

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/"
        aria-label="Home"
        className={`${circleBase} ${circleIdle}`}
      >
        <HomeIcon className="h-4 w-4" />
      </Link>

      <nav
        aria-label="Main"
        className="relative flex items-center gap-1 rounded-[22px] border border-ink/10 bg-white/80 p-1.5 shadow-lg backdrop-blur-xl backdrop-saturate-150"
      >
        {ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-xl px-4 py-2 font-body text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-ink text-white"
                  : "bg-transparent text-ink/70 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/playground"
        aria-label="Play"
        className={`${circleBase} ${isGamePage ? circleActive : circleIdle}`}
      >
        <JoystickIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
