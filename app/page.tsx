import Link from "next/link";
import { repository } from "@/lib/db";
import { ArcadeCabinet } from "@/components/arcade/ArcadeCabinet";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Arrange",
    body: "Photograph one object or arrange several with space between them.",
  },
  {
    title: "Snap",
    body: "Take one photo. No prompts, no tile editors, no accounts.",
  },
  {
    title: "Play",
    body: "Pens become platforms, mugs bounce you, scissors hurt. Reach the goal.",
  },
  {
    title: "Publish",
    body: "Share a public link and watch real players appear on the leaderboard.",
  },
];

export default async function HomePage() {
  const featured = await repository().listGames({
    sort: "trending",
    limit: 3,
    offset: 0,
  });

  return (
    <div className="space-y-12">
      <section className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-center">
        <div className="space-y-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-screen">
            Arrange. Snap. Play. Publish.
          </p>
          <h1 className="marquee-title text-4xl leading-none text-paper sm:text-5xl">
            Turn the stuff on your desk into a real platformer
          </h1>
          <p className="max-w-xl font-body text-base text-paper/80">
            Playground looks at one photo of physical objects and builds a playable 2D
            level from what it sees. Every level is checked to be finishable before
            you play it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/create" className="btn-primary">
              Make a game from a photo
            </Link>
            <Link href="/arcade" className="btn-secondary">
              Play the arcade
            </Link>
          </div>
        </div>

        <div className="panel animate-wobble">
          <ol className="space-y-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-token font-mono text-xs text-ink">
                  {index + 1}
                </span>
                <div>
                  <p className="font-display text-sm uppercase text-token">
                    {step.title}
                  </p>
                  <p className="font-body text-sm text-paper/75">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="marquee-title text-2xl text-token">Fresh from the arcade</h2>
          <Link href="/arcade" className="btn-ghost px-3 py-2 text-xs">
            See all games
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="panel">
            <p className="font-body text-sm text-paper/80">
              No games yet. Yours can be the first one in the arcade.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((game) => (
              <ArcadeCabinet key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
