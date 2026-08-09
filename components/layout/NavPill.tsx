"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const ITEMS = [
  { href: "/", label: "Home", isHome: true },
  { href: "/playground", label: "Playground" },
  { href: "/stats", label: "Stats" },
  { href: "/create", label: "Make a game" },
];

// Routes that render a light/white background instead of the dark video bg,
// so the pill needs an inverted, dark-on-light color scheme to stay legible.
const LIGHT_BG_ROUTES = ["/", "/playground"];

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

export function NavPill() {
  const pathname = usePathname();
  const isLightBg = LIGHT_BG_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`),
  );
  const containerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [highlight, setHighlight] = useState<{ left: number; width: number } | null>(null);

  function handleEnter(index: number) {
    const el = itemRefs.current[index];
    const container = containerRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setHighlight({ left: elRect.left - containerRect.left, width: elRect.width });
    setHovered(index);
  }

  return (
    <nav
      ref={containerRef}
      aria-label="Main"
      onMouseLeave={() => setHovered(null)}
      className={`relative flex items-center rounded-[22px] p-1.5 shadow-lg backdrop-blur-xl backdrop-saturate-150 ${
        isLightBg
          ? "bg-white/70 shadow-black/10 ring-1 ring-black/[0.06]"
          : "bg-white/20 shadow-black/20"
      }`}
    >
      <span
        className={`nav-highlight pointer-events-none absolute top-1.5 bottom-1.5 rounded-xl ${
          isLightBg ? "bg-ink" : "bg-white"
        }`}
        style={{
          left: highlight ? highlight.left : 0,
          width: highlight ? highlight.width : 0,
          opacity: hovered !== null && highlight ? 1 : 0,
        }}
      />
      {ITEMS.map((item, index) => {
        const isHovered = hovered === index;
        const isStaticWhite = hovered === null && index !== 0;
        const isHighlighted = isHovered || isStaticWhite;
        const textColor = isLightBg
          ? isHighlighted
            ? "text-white"
            : "text-ink"
          : isHighlighted
            ? "text-ink"
            : "text-white";
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.isHome ? "Home" : undefined}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            onMouseEnter={() => handleEnter(index)}
            className={`relative z-10 rounded-xl font-body font-medium transition-colors duration-150 ${
              item.isHome ? "p-2" : "px-4 py-2 text-sm"
            } ${textColor} ${
              isStaticWhite ? (isLightBg ? "bg-ink" : "bg-white") : "bg-transparent"
            }`}
          >
            {item.isHome ? <HomeIcon className="h-4 w-4" /> : item.label}
          </Link>
        );
      })}
    </nav>
  );
}
