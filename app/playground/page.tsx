import type { Metadata } from "next";
import { PlaygroundBrowseAllSection } from "@/components/playground/PlaygroundBrowseAllSection";
import { PlaygroundHero } from "@/components/playground/PlaygroundHero";
import { PlaygroundListSection } from "@/components/playground/PlaygroundListSection";
import { PlaygroundShelf } from "@/components/playground/PlaygroundShelf";
import { formatMs } from "@/components/ui/formatters";
import { repository } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Playground",
  description: "Play platformers generated from photos of real objects.",
};

const DIFFICULTY_LABELS = ["Gentle", "Easy", "Tricky", "Hard", "Brutal"];

export default async function PlaygroundPage() {
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
      <div className="fixed inset-0 -z-10 bg-[#f2eeee]" />
      <div className="space-y-10">
        <header className="space-y-1">
          <p className="font-inter text-sm font-medium uppercase tracking-wide text-appleGray">
            Playground
          </p>
          <h1
            className="font-inter font-medium text-appleInk"
            style={{ fontSize: 30, letterSpacing: "-0.04em" }}
          >
            Play
          </h1>
          <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
            Every game here started as a photo of real objects.
          </p>
        </header>

        <PlaygroundHero games={trending} />

        <PlaygroundShelf
          title="New Arrivals"
          eyebrow="New Game"
          subtitle={(game) => `${game.creatorName} · ${game.detectedObjectCount} objects`}
          games={newest}
        />

        <PlaygroundListSection
          title="Most Loved"
          subtitle={(game) => `${game.remixes} remixes · ${game.likes} likes`}
          games={mostRemixed}
        />

        <PlaygroundShelf
          title="Built For Speed"
          eyebrow="Fastest Clear"
          subtitle={(game) => `Best: ${formatMs(game.fastestMs)}`}
          games={fastest}
        />

        <PlaygroundListSection
          title="Hardest Challenges"
          subtitle={(game) =>
            DIFFICULTY_LABELS[Math.min(4, Math.max(0, game.difficulty - 1))]
          }
          games={hardest}
        />

        <PlaygroundBrowseAllSection initialGames={newest} />
      </div>
    </>
  );
}
