"use client";

import Image from "next/image";
import type { DetectedObject } from "@/lib/backboard/schemas";

type Props = {
  imageUrl: string;
  scanning: boolean;
  objects?: DetectedObject[];
};

/** Photo with a scanline sweep and, once analysis lands, detected object boxes. */
export function ScanAnimation({ imageUrl, scanning, objects = [] }: Props) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-appleBg">
      <Image
        src={imageUrl}
        alt="Your photo being analyzed"
        fill
        unoptimized
        className="object-contain"
      />

      {scanning ? (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-16 animate-scanline bg-gradient-to-b from-transparent via-appleBlue/50 to-transparent"
        />
      ) : null}

      {objects.map((object) => (
        <div
          key={object.id}
          aria-hidden
          className="absolute rounded-md border-2 border-appleBlue bg-appleBlue/10"
          style={{
            left: `${object.bounds.x * 100}%`,
            top: `${object.bounds.y * 100}%`,
            width: `${object.bounds.width * 100}%`,
            height: `${object.bounds.height * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
