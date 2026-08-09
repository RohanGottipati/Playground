import type { Metadata } from "next";
import { ArcadeGrid } from "@/components/arcade/ArcadeGrid";
import { ArcadeHero } from "@/components/arcade/ArcadeHero";
import { ArcadeListSection } from "@/components/arcade/ArcadeListSection";
import { ArcadeShelf } from "@/components/arcade/ArcadeShelf";
import { formatMs } from "@/components/ui/formatters";
import { repository } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Arcade — Playground",
  description: "Play platformers generated from photos of real objects.",
};

const DIFFICULTY_LABELS = ["Gentle", "Easy", "Tricky", "Hard", "Brutal"];

export default async function ArcadePage() {
  const repo = repository();
  const [trending, newest, mostRemixed, fastest, hardest] = await Promise.all([
    repo.listGames({ sort: "trending", limit: 3, offset: 0 }),
    repo.listGames({ sort: "newest", limit: 8, offset: 0 }),
    repo.listGames({ sort: "most_remixed", limit: 9, offset: 0 }),
    repo.listGames({ sort: "fastest", limit: 8, offset: 0 }),
    repo.listGames({ sort: "hardest", limit: 9, offset: 0 }),
  ]);

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-white" />
      <div className="space-y-10">
        <header className="space-y-1">
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-appleGray">
            Arcade
          </p>
          <h1 className="font-body text-3xl font-bold text-appleInk">Play</h1>
          <p className="font-body text-sm text-appleGray">
            Every game here started as a photo of real objects.
          </p>
        </header>

        <ArcadeHero games={trending} />

        <ArcadeShelf
          title="New Arrivals"
          eyebrow="New Game"
          subtitle={(game) => `${game.creatorName} · ${game.detectedObjectCount} objects`}
          games={newest}
        />

        <ArcadeListSection
          title="Most Loved"
          subtitle={(game) => `${game.remixes} remixes · ${game.likes} likes`}
          games={mostRemixed}
        />

        <ArcadeShelf
          title="Built For Speed"
          eyebrow="Fastest Clear"
          subtitle={(game) => `Best: ${formatMs(game.fastestMs)}`}
          games={fastest}
        />

        <ArcadeListSection
          title="Hardest Challenges"
          subtitle={(game) =>
            DIFFICULTY_LABELS[Math.min(4, Math.max(0, game.difficulty - 1))]
          }
          games={hardest}
        />

        <section className="space-y-4">
          <h2 className="font-body text-xl font-bold text-appleInk">
            Browse All Games
          </h2>
          <ArcadeGrid initialGames={newest} />
        </section>
      </div>
    </>
  );
}
