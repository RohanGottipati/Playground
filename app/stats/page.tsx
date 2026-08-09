import type { Metadata } from "next";
import { StatsDashboard } from "@/components/stats/StatsDashboard";
import { repository } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats — Playground",
  description: "Real numbers from every game generated and played in Playground.",
};

export default async function StatsPage() {
  const stats = await repository().getStats();

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
      </div>
    </>
  );
}
