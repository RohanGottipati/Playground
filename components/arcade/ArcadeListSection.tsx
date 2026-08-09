import Image from "next/image";
import Link from "next/link";
import type { GameSummary } from "@/lib/db/types";

export function ArcadeListSection({
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
        <h2 className="font-body text-xl font-bold text-appleInk">{title}</h2>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            className="font-body text-sm font-medium text-appleBlue hover:underline"
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
              <p className="truncate font-body text-sm font-semibold text-appleInk">
                {game.title}
              </p>
              <p className="truncate font-body text-xs text-appleGray">
                {subtitle(game)}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-appleBlue/30 px-3 py-1 font-body text-xs font-semibold text-appleBlue transition group-hover:bg-appleBlue group-hover:text-white">
              Play
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
