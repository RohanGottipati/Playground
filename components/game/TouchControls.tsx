"use client";

import type { ControlState } from "@/game/bus";

type Props = {
  controls: ControlState | null;
  onRestart: () => void;
  canShoot?: boolean;
};

function holdHandlers(
  controls: ControlState | null,
  key: "left" | "right" | "jump" | "shoot",
) {
  const set = (value: boolean) => {
    if (controls) controls[key] = value;
  };
  return {
    onPointerDown: (event: React.PointerEvent) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      set(true);
    },
    onPointerUp: () => set(false),
    onPointerCancel: () => set(false),
    onLostPointerCapture: () => set(false),
  };
}

/** Always-visible touch controls: the game must be playable on a phone. */
export function TouchControls({ controls, onRestart, canShoot = false }: Props) {
  return (
    // touch-none: repeated taps while playing must not zoom the browser.
    <div className="flex touch-none select-none items-center justify-between gap-3 md:hidden">
      <div className="flex gap-3">
        <button
          type="button"
          aria-label="Move left"
          className="btn-secondary h-16 w-16 text-2xl"
          {...holdHandlers(controls, "left")}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Move right"
          className="btn-secondary h-16 w-16 text-2xl"
          {...holdHandlers(controls, "right")}
        >
          →
        </button>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          aria-label="Restart level"
          className="btn-ghost h-16 w-16 text-lg"
          onClick={onRestart}
        >
          ⟳
        </button>
        {canShoot ? (
          <button
            type="button"
            aria-label="Shoot"
            className="btn-secondary h-16 w-16 text-lg"
            {...holdHandlers(controls, "shoot")}
          >
            🎯
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Jump"
          className="btn-primary h-16 w-20 text-lg"
          {...holdHandlers(controls, "jump")}
        >
          Jump
        </button>
      </div>
    </div>
  );
}
