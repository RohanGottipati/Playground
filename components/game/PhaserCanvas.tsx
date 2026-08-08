"use client";

import { useEffect, useRef, useState } from "react";
import type { ControlState, GameBus } from "@/game/bus";
import type { GameSpec } from "@/game/types";

export type PhaserCanvasProps = {
  spec: GameSpec;
  onBus: (bus: GameBus, controls: ControlState) => void;
};

/**
 * Mounts one Phaser instance for the given spec and hands the event bus back to
 * React. Frame state stays inside Phaser.
 */
export function PhaserCanvas({ spec, onBus }: PhaserCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let destroy: (() => void) | undefined;
    let cancelled = false;

    async function boot() {
      const container = containerRef.current;
      if (!container) return;
      try {
        const { createGame } = await import("@/game/createGame");
        const handle = await createGame(container, spec);
        if (cancelled) {
          handle.destroy();
          return;
        }
        destroy = handle.destroy;
        onBus(handle.bus, handle.controls);
      } catch (cause) {
        console.error("phaser boot failed", cause);
        setError("This game could not load correctly. Refresh the page or return to the arcade.");
      }
    }

    void boot();

    return () => {
      cancelled = true;
      destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec]);

  if (error) {
    return (
      <div className="panel text-sm text-paper" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-label={`Playable level: ${spec.title}`}
      className="aspect-[16/9] w-full overflow-hidden rounded-2xl border-[3px] border-ink bg-black shadow-sticker"
    />
  );
}
