"use client";

import { useEffect, useRef } from "react";

export function BackgroundVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const sync = () => {
      if (reduceMotion.matches) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    sync();
    reduceMotion.addEventListener("change", sync);
    return () => reduceMotion.removeEventListener("change", sync);
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}
