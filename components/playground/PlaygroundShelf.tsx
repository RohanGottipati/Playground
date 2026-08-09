import Image from "next/image";
import Link from "next/link";
import type { GameSummary } from "@/lib/db/types";

export function PlaygroundShelf({
  title,
  eyebrow,
  subtitle,
  games,
  seeAllHref,
}: {
  title: string;
  eyebrow: string | ((game: GameSummary) => string);
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
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/game/${game.slug}`}
            className="group w-[240px] shrink-0 snap-start"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-appleBg">
              <Image
                src={game.sourceImageUrl}
                alt={`Objects used to build ${game.title}`}
                fill
                unoptimized
                sizes="240px"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="font-inter text-[11px] font-medium uppercase tracking-wide text-appleGray">
                {typeof eyebrow === "function" ? eyebrow(game) : eyebrow}
              </p>
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
          </Link>
        ))}
      </div>
    </section>
  );
}
