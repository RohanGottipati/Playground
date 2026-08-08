import Link from "next/link";
import { HeroTitle } from "@/components/home/HeroTitle";

export default function HomePage() {
  return (
    <section className="flex min-h-[75vh] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <HeroTitle />
      </div>
      <div className="mt-24 flex flex-wrap justify-center gap-3">
        <Link href="/create" className="btn-glass-primary">
          Make a game from a photo
        </Link>
        <Link href="/arcade" className="btn-glass-secondary">
          Play the arcade
        </Link>
      </div>
    </section>
  );
}
