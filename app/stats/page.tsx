import type { Metadata } from "next";
import { TechnationDashboard } from "@/components/stats/TechnationDashboard";
import { repository } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Technation Data Intelligence Dashboard — Playground",
  description:
    "Live spatial telemetry, fatality heatmaps and desk-object topology across every Playground arcade game.",
};

export default async function StatsPage() {
  const db = repository();
  const [stats, games] = await Promise.all([
    db.getStats(),
    db.listGames({ sort: "newest", limit: 24, offset: 0 }),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="marquee-title text-3xl text-token">
          Technation Data Intelligence Dashboard
        </h1>
        <p className="font-body text-sm text-paper/75">
          Live arcade telemetry, spatial death heatmaps and vision-AI desk topology, sourced
          from every scan and every run.
        </p>
      </header>
      <TechnationDashboard initialStats={stats} initialGames={games} />
    </div>
  );
}
