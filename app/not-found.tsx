import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel space-y-4 text-center">
      <h1 className="marquee-title text-2xl text-marquee">Game not found</h1>
      <p className="font-body text-sm text-paper/80">
        This game may have been unpublished, or the link is wrong.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/arcade" className="btn-primary">
          Browse the arcade
        </Link>
        <Link href="/create" className="btn-secondary">
          Make your own
        </Link>
      </div>
    </div>
  );
}
