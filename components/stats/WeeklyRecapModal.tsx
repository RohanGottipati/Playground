"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COMPONENT_IDS,
  componentLabel,
  placeholderGamesFor,
} from "@/components/stats/componentCatalog";
import { formatPercent } from "@/components/ui/formatters";
import type { LiveOriginSnapshot, StatsSnapshot } from "@/lib/db/types";

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
      style={direction === "left" ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function Stat({
  label,
  value,
  hint,
  compact,
}: {
  label: string;
  value: string;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-2xl bg-appleBg ${compact ? "p-4" : "p-6"}`}>
      <p
        className="font-inter text-xs font-medium uppercase tracking-wide text-appleGray"
        style={{ letterSpacing: "0.02em" }}
      >
        {label}
      </p>
      <p
        className="mt-1 font-inter font-medium text-appleInk"
        style={{ fontSize: compact ? 26 : 44, letterSpacing: "-0.03em" }}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 font-inter text-xs text-appleGray" style={{ letterSpacing: "-0.01em" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type Props = {
  stats: StatsSnapshot;
  onClose: () => void;
};

const PAGE_COUNT = 4;

export function WeeklyRecapModal({ stats, onClose }: Props) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setPage((current) => Math.min(current + 1, PAGE_COUNT - 1));
      if (event.key === "ArrowLeft") setPage((current) => Math.max(current - 1, 0));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const isLast = page === PAGE_COUNT - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-appleInk/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recap-headline"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between px-10 pt-8">
          <p className="font-inter text-base font-medium uppercase tracking-wide text-appleGray">
            Weekly recap
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-appleGray transition hover:bg-appleBg hover:text-appleInk"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-10 py-8">
          {page === 0 ? <PageOne stats={stats} /> : null}
          {page === 1 ? <PageTwo /> : null}
          {page === 2 ? <PageFour /> : null}
          {page === 3 ? <PageThree stats={stats} /> : null}
        </div>

        <div className="flex shrink-0 items-center justify-between px-10 pb-8 pt-4">
          <div className="flex items-center gap-2" aria-hidden>
            {Array.from({ length: PAGE_COUNT }).map((_, index) => (
              <span
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === page ? "w-8 bg-appleInk" : "w-2 bg-appleGray/30"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            {page > 0 ? (
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                aria-label="Previous page"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-appleGray/30 text-appleInk transition hover:border-appleGray/60"
              >
                <ArrowIcon direction="left" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => (isLast ? onClose() : setPage((current) => current + 1))}
              aria-label={isLast ? "Close recap" : "Next page"}
              className={
                isLast
                  ? "rounded-full bg-appleInk px-7 py-3 font-inter text-base font-medium text-white transition hover:bg-black"
                  : "flex h-12 w-12 items-center justify-center rounded-full bg-appleInk text-white transition hover:bg-black"
              }
              style={isLast ? { letterSpacing: "-0.02em" } : undefined}
            >
              {isLast ? "Done" : <ArrowIcon direction="right" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageOne({ stats }: { stats: StatsSnapshot }) {
  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="space-y-1">
        <h2
          id="recap-headline"
          className="font-inter font-medium text-appleInk"
          style={{ fontSize: 26, letterSpacing: "-0.04em" }}
        >
          Your Playground Weekly Recap
        </h2>
        <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
          A snapshot of everything the community built and played this week.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Games published" value={String(stats.publishedGames)} compact />
        <Stat label="Games played" value={String(stats.gamesPlayed)} compact />
        <Stat label="Objects scanned" value={String(stats.objectsScanned)} compact />
        <Stat
          label="Avg. completion"
          value={formatPercent(stats.averageCompletionRate)}
          hint={`${stats.completedRuns} finished runs`}
          compact
        />
      </div>
      <LiveGlobe />
    </div>
  );
}

/** Looping globe footage; hover reveals the site-wide live session + city count. */
function LiveGlobe() {
  const [hovered, setHovered] = useState(false);
  const [origin, setOrigin] = useState<LiveOriginSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hovered || origin || loading) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/stats/live-origins")
      .then((response) => {
        if (!response.ok) throw new Error("live origins unavailable");
        return response.json() as Promise<LiveOriginSnapshot>;
      })
      .then((body) => {
        if (!cancelled) setOrigin(body);
      })
      .catch((error) => {
        console.warn("live origins fetch failed", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hovered, origin, loading]);

  return (
    <div
      className="group relative min-h-[220px] flex-1 overflow-hidden rounded-2xl bg-appleBg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="group"
      aria-label="Live global activity"
    >
      <video
        className="h-full w-full object-cover"
        src="/video/earth.mp4"
        poster="/video/earth-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute bottom-4 left-4 flex items-center gap-4 rounded-2xl bg-white/90 px-5 py-4 shadow-xl backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-out ${
          hovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div>
          <p
            className="font-inter text-xs font-medium uppercase tracking-wide text-appleGray"
            style={{ letterSpacing: "0.02em" }}
          >
            Live right now
          </p>
          <p
            className="mt-0.5 font-inter font-medium text-appleInk"
            style={{ fontSize: 28, letterSpacing: "-0.03em" }}
          >
            {origin ? origin.activeSessions : loading ? "—" : 0}
          </p>
          <p className="mt-0.5 font-inter text-xs text-appleGray" style={{ letterSpacing: "-0.01em" }}>
            playing from {origin ? origin.cityCount : loading ? "…" : 0}{" "}
            {origin?.cityCount === 1 ? "city" : "cities"} worldwide
          </p>
        </div>
      </div>
    </div>
  );
}

function PageTwo() {
  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="space-y-1">
        <h2 className="font-inter font-medium text-appleInk" style={{ fontSize: 26, letterSpacing: "-0.04em" }}>
          Every component in the catalog
        </h2>
        <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
          {COMPONENT_IDS.length} objects power every generated game. Click one to see where it showed up.
        </p>
      </div>
      <ComponentGraph />
    </div>
  );
}

type GraphNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
};

/** Small deterministic PRNG so the layout is stable across re-renders. */
function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function useGraphLayout() {
  return useMemo(() => {
    const random = mulberry32(1337);
    const nodes: GraphNode[] = COMPONENT_IDS.map((id) => ({
      id,
      name: componentLabel(id),
      x: 3 + random() * 94,
      y: 5 + random() * 90,
      size: 16 + random() * 22,
    }));
    const edgeCount = Math.round(nodes.length * 0.9);
    const edges: [number, number][] = [];
    for (let index = 0; index < edgeCount; index += 1) {
      const a = Math.floor(random() * nodes.length);
      let b = Math.floor(random() * nodes.length);
      if (b === a) b = (b + 1) % nodes.length;
      edges.push([a, b]);
    }
    return { nodes, edges };
  }, []);
}

/** A loose network of every catalog component's sprite, connected by random lines. Click a node to see (placeholder) games that used it. */
function ComponentGraph() {
  const { nodes, edges } = useGraphLayout();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = nodes.find((node) => node.id === selectedId) ?? null;
  const games = useMemo(
    () => (selected ? placeholderGamesFor(selected.id) : []),
    [selected],
  );

  return (
    <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-2xl bg-appleBg">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {edges.map(([a, b], index) => {
          const from = nodes[a];
          const to = nodes[b];
          if (!from || !to) return null;
          return (
            <line
              key={index}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="#1d1d1f"
              strokeOpacity={0.07}
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          title={node.name}
          onClick={() => setSelectedId((current) => (current === node.id ? null : node.id))}
          className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.06] transition hover:z-10 hover:scale-125 hover:shadow-md ${
            selectedId === node.id ? "z-10 ring-2 ring-appleInk" : ""
          }`}
          style={{ left: `${node.x}%`, top: `${node.y}%`, width: node.size, height: node.size }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/sprites/${node.id}.svg`}
            alt=""
            aria-hidden
            className="h-2/3 w-2/3 object-contain"
            loading="lazy"
          />
        </button>
      ))}

      {selected ? (
        <div className="absolute bottom-3 left-3 right-3 max-h-[55%] overflow-y-auto rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-xl backdrop-saturate-150 sm:left-auto sm:w-72">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/sprites/${selected.id}.svg`}
                alt=""
                aria-hidden
                className="h-6 w-6 object-contain"
              />
              <p
                className="font-inter text-sm font-medium text-appleInk"
                style={{ letterSpacing: "-0.01em" }}
              >
                {selected.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-appleGray transition hover:bg-appleBg hover:text-appleInk"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          {games.length > 0 ? (
            <ul className="space-y-1.5">
              {games.map((title, index) => (
                <li
                  key={`${title}-${index}`}
                  className="font-inter text-xs text-appleGray"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-inter text-xs text-appleGray" style={{ letterSpacing: "-0.01em" }}>
              Not used in a published game yet.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function PageThree({ stats }: { stats: StatsSnapshot }) {
  return (
    <div className="flex h-full flex-col justify-center space-y-10">
      <div className="space-y-2">
        <h2 className="font-inter font-medium text-appleInk" style={{ fontSize: 36, letterSpacing: "-0.04em" }}>
          Wrapped up
        </h2>
        <p className="font-inter text-lg text-appleGray" style={{ letterSpacing: "-0.01em" }}>
          The chaos, the discoveries, and the remixes.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <Stat label="Total deaths" value={String(stats.totalDeaths)} />
        <Stat label="Mechanics discovered" value={String(stats.mechanicsDiscovered)} />
        <Stat label="Remixes created" value={String(stats.remixesCreated)} />
        <Stat label="Completed runs" value={String(stats.completedRuns)} />
      </div>
      <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
        Thanks for playing in the Playground this week. Come back and make something new.
      </p>
    </div>
  );
}

function PageFour() {
  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="space-y-1">
        <h2 className="font-inter font-medium text-appleInk" style={{ fontSize: 26, letterSpacing: "-0.04em" }}>
          You made this smarter
        </h2>
        <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
          Every scan you take helps Playground recognize the world better.
        </p>
      </div>
      <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-2xl bg-appleBg">
        <video
          className="h-full w-full object-cover"
          src="/video/dance.mp4"
          poster="/video/dance-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 px-6 py-6 shadow-xl backdrop-blur-xl backdrop-saturate-150">
          <p
            className="font-inter font-medium text-blue-600"
            style={{ fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.3 }}
          >
            Your contribution made Playground smarter. Your 8 photos improved laptop recognition by 6.2%,
            helping create better games for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
