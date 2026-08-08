"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const ITEMS = [
  { href: "/", label: "Playground", serif: true },
  { href: "/arcade", label: "Arcade" },
  { href: "/stats", label: "Stats" },
  { href: "/create", label: "Make a game" },
];

export function NavPill() {
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
      className="relative flex items-center rounded-[22px] bg-white/20 p-1.5 shadow-lg shadow-black/20 backdrop-blur-md"
    >
      <span
        className="nav-highlight pointer-events-none absolute top-1.5 bottom-1.5 rounded-xl bg-white"
        style={{
          left: highlight ? highlight.left : 0,
          width: highlight ? highlight.width : 0,
          opacity: hovered !== null && highlight ? 1 : 0,
        }}
      />
      {ITEMS.map((item, index) => {
        const isHovered = hovered === index;
        const isStaticWhite = hovered === null && index !== 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            onMouseEnter={() => handleEnter(index)}
            className={`relative z-10 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-150 ${
              item.serif ? "font-serif" : "font-body"
            } ${isHovered || isStaticWhite ? "text-ink" : "text-white"} ${
              isStaticWhite ? "bg-white" : "bg-transparent"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
