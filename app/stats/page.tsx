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
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="marquee-title text-3xl text-token">Community stats</h1>
        <p className="font-body text-sm text-paper/75">
          Every number here comes from real generations and real plays. Empty charts
          mean nobody has done that yet.
        </p>
      </header>
      <StatsDashboard initial={stats} />
    </div>
  );
}
