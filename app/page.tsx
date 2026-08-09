"use client";

import { useState } from "react";
import Link from "next/link";
import { HeroTitle } from "@/components/home/HeroTitle";
import { HeroCharacter } from "@/components/home/HeroCharacter";

export default function HomePage() {
  const [pointing, setPointing] = useState(false);

  return (
    <section className="relative min-h-[85vh]">
      <div className="fixed inset-0 -z-20 bg-[#fdfdfd]" />
      <div className="fixed inset-y-0 left-0 z-[1] flex w-full flex-col items-start justify-start px-6 pt-28 text-left sm:w-[40%] sm:px-12 sm:pt-32">
        <HeroTitle />
        <Link
          href="/arcade"
          onMouseEnter={() => setPointing(true)}
          onMouseLeave={() => setPointing(false)}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-appleInk px-6 py-3 font-inter text-sm font-medium text-white shadow-lg shadow-black/10 transition hover:bg-black active:scale-[0.98]"
        >
          Enter the Playground
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 left-0 z-[1] flex w-full items-end justify-start sm:w-[40%]">
        <div className="h-[48vh] max-h-[48vh] w-60 sm:w-72">
          <HeroCharacter pointing={pointing} />
        </div>
      </div>
    </section>
  );
}
