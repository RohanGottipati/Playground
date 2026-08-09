"use client";

import { useEffect, useState } from "react";

const FRAME_COUNT = 9;
const FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) => `/character/P${i + 1}.jpg`);
const POINT_FRAME = "/character/Point.jpg";
const ALL_FRAMES = [...FRAMES, POINT_FRAME];

export function HeroCharacter({ pointing = false }: { pointing?: boolean }) {
  const [frame, setFrame] = useState(0);
  const src = pointing ? POINT_FRAME : FRAMES[frame];

  // Every frame is preloaded/decoded up front so swapping `src` on this one
  // <img> is an instant, already-cached paint — no crossfade animation, so
  // there's no blending between two differently-posed frames (which is what
  // read as motion blur).
  useEffect(() => {
    ALL_FRAMES.forEach((frameSrc) => {
      const img = new Image();
      img.src = frameSrc;
    });
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let pending: PointerEvent | null = null;

    const applyMove = () => {
      raf = 0;
      const event = pending;
      if (!event) return;

      // The viewport height is split into 9 equal zones: the top zone maps
      // to P1, the bottom zone maps to P9, regardless of horizontal position.
      const zoneHeight = window.innerHeight / FRAME_COUNT;
      const zone = Math.floor(event.clientY / zoneHeight);
      setFrame(Math.min(FRAME_COUNT - 1, Math.max(0, zone)));
    };

    const handleMove = (event: PointerEvent) => {
      pending = event;
      if (!raf) raf = requestAnimationFrame(applyMove);
    };

    window.addEventListener("pointermove", handleMove);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none relative h-full w-full select-none" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        loading="eager"
        decoding="sync"
        className="absolute inset-0 h-full w-full object-contain object-bottom"
      />
    </div>
  );
}
