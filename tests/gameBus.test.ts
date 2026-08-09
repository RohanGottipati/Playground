import { describe, expect, it, vi } from "vitest";
import { GameBus } from "@/game/bus";

describe("GameBus startup state", () => {
  it("replays readiness to listeners attached after Phaser boot", () => {
    const bus = new GameBus();
    const handler = vi.fn();
    bus.emit("ready", undefined);
    bus.on("ready", handler);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("replays loader failures to listeners attached after Phaser boot", () => {
    const bus = new GameBus();
    const handler = vi.fn();
    bus.emit("error", { message: "missing sprite" });
    bus.on("error", handler);
    expect(handler).toHaveBeenCalledWith({ message: "missing sprite" });
  });

  it("does not replay frame-by-frame HUD events", () => {
    const bus = new GameBus();
    const handler = vi.fn();
    bus.emit("hud", {
      elapsedMs: 0,
      deaths: 0,
      collectibles: 0,
      totalCollectibles: 0,
    });
    bus.on("hud", handler);
    expect(handler).not.toHaveBeenCalled();
  });
});
