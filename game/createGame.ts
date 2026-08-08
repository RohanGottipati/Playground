import type Phaser from "phaser";
import { createControlState, GameBus, type ControlState } from "./bus";
import type { GameSpec } from "./types";

export type GameHandle = {
  game: Phaser.Game;
  bus: GameBus;
  controls: ControlState;
  destroy: () => void;
};

/**
 * Creates the Phaser instance. Phaser is imported dynamically so it never runs
 * during server rendering.
 */
export async function createGame(
  parent: HTMLElement,
  spec: GameSpec,
): Promise<GameHandle> {
  const [{ default: Phaser }, { buildPhaserConfig }] = await Promise.all([
    import("phaser"),
    import("./config"),
  ]);

  const bus = new GameBus();
  const controls = createControlState();
  const game = new Phaser.Game(buildPhaserConfig(parent, spec));
  game.registry.set("spec", spec);
  game.registry.set("bus", bus);
  game.registry.set("controls", controls);

  return {
    game,
    bus,
    controls,
    destroy: () => {
      bus.clear();
      game.destroy(true);
    },
  };
}
