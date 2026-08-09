import type { Metadata } from "next";
import { StatsDashboard } from "@/components/stats/StatsDashboard";
import { TechnationDashboard } from "@/components/stats/TechnationDashboard";
import { repository } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats — Playground",
  description:
    "Real community metrics and live spatial telemetry from Playground games.",
};

export default async function StatsPage() {
  const db = repository();
  const [stats, games] = await Promise.all([
    db.getStats(),
    db.listGames({ sort: "newest", limit: 24, offset: 0 }),
  ]);

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-white" />
      <div className="space-y-10">
        <header className="space-y-1">
          <p className="font-inter text-sm font-medium uppercase tracking-wide text-appleGray">
            Stats
          </p>
          <h1
            className="font-inter font-medium text-appleInk"
            style={{ fontSize: 30, letterSpacing: "-0.04em" }}
          >
            Community stats
          </h1>
          <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
            Every number here comes from real generations and real plays. Empty
            charts mean nobody has done that yet.
          </p>
        </header>

        <StatsDashboard initial={stats} />

        <section className="space-y-6" aria-labelledby="live-intelligence-title">
          <header className="space-y-1">
            <p className="font-inter text-sm font-medium uppercase tracking-wide text-appleGray">
              Live intelligence
            </p>
            <h2
              id="live-intelligence-title"
              className="font-inter font-medium text-appleInk"
              style={{ fontSize: 24, letterSpacing: "-0.04em" }}
            >
              Game telemetry
            </h2>
            <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
              Live sessions, fatalities, spatial hotspots and object topology from real plays.
            </p>
          </header>

          <TechnationDashboard initialStats={stats} initialGames={games} />
        </section>
      </div>
    </>
  );
}
