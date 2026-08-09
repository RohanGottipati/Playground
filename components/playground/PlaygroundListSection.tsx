import Image from "next/image";
import Link from "next/link";
import type { GameSummary } from "@/lib/db/types";

export function PlaygroundListSection({
  title,
  subtitle,
  games,
  seeAllHref,
}: {
  title: string;
  subtitle: (game: GameSummary) => string;
  games: GameSummary[];
  seeAllHref?: string;
}) {
  if (games.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2
          className="font-inter font-medium text-appleInk"
          style={{ fontSize: 20, letterSpacing: "-0.03em" }}
        >
          {title}
        </h2>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            className="font-inter text-sm font-medium text-appleBlue hover:underline"
            style={{ letterSpacing: "-0.01em" }}
          >
            See All
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/game/${game.slug}`}
            className="group flex items-center gap-3"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-appleBg">
              <Image
                src={game.sourceImageUrl}
                alt={`Objects used to build ${game.title}`}
                fill
                unoptimized
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-inter font-medium text-appleInk"
                style={{ fontSize: 14, letterSpacing: "-0.02em" }}
              >
                {game.title}
              </p>
              <p
                className="truncate font-inter text-xs text-appleGray"
                style={{ letterSpacing: "-0.01em" }}
              >
                {subtitle(game)}
              </p>
            </div>
            <span
              className="shrink-0 rounded-full border border-appleBlue/30 px-3 py-1 font-inter text-xs font-medium text-appleBlue transition group-hover:bg-appleBlue group-hover:text-white"
              style={{ letterSpacing: "-0.01em" }}
            >
              Play
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
