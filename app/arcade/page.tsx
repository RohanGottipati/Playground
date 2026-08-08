import type { Metadata } from "next";
import { ArcadeGrid } from "@/components/arcade/ArcadeGrid";
import { repository } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Arcade — Playground",
  description: "Play platformers generated from photos of real objects.",
};

export default async function ArcadePage() {
  const games = await repository().listGames({
    sort: "newest",
    limit: 12,
    offset: 0,
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="marquee-title text-3xl text-token">The arcade</h1>
        <p className="font-body text-sm text-paper/75">
          Every game here started as a photo of real objects.
        </p>
      </header>
      <ArcadeGrid initialGames={games} />
    </div>
  );
}
