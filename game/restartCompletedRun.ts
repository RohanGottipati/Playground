import type * as Phaser from "phaser";
import type { GameBus } from "@/game/bus";

/** Shared completed-run transition used by keyboard and React/touch controls. */
export function restartCompletedRun(
  scene: Pick<Phaser.Scene, "registry" | "scene">,
): void {
  const bus = scene.registry.get("bus") as GameBus;
  bus.emit("gameEvent", { type: "game_restarted" });
  scene.scene.get("GameScene").scene.restart();
  scene.scene.stop();
}
