import { describe, expect, it, vi } from "vitest";
import { GameBus } from "@/game/bus";
import { restartCompletedRun } from "@/game/restartCompletedRun";

describe("restartCompletedRun", () => {
  it("emits one restart event, restarts gameplay, and stops the result overlay", () => {
    const bus = new GameBus();
    const onGameEvent = vi.fn();
    bus.on("gameEvent", onGameEvent);
    const restart = vi.fn();
    const stop = vi.fn();
    const scene = {
      registry: { get: vi.fn(() => bus) },
      scene: {
        get: vi.fn(() => ({ scene: { restart } })),
        stop,
      },
    };

    restartCompletedRun(scene as never);

    expect(onGameEvent).toHaveBeenCalledOnce();
    expect(onGameEvent).toHaveBeenCalledWith({ type: "game_restarted" });
    expect(restart).toHaveBeenCalledOnce();
    expect(stop).toHaveBeenCalledOnce();
  });
});
