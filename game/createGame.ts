import type * as Phaser from "phaser";
import { createControlState, GameBus, type ControlState } from "./bus";
import type { GameSpec } from "./types";

export type GameHandle = {
  game: Phaser.Game;
  bus: GameBus;
  controls: ControlState;
  destroy: () => void;
};

function isTextEntryTarget(element: Element | null): boolean {
  if (!element) return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (element as HTMLElement).isContentEditable;
}

/**
 * Creates the Phaser instance. Phaser is imported dynamically so it never runs
 * during server rendering.
 */
export async function createGame(
  parent: HTMLElement,
  spec: GameSpec,
): Promise<GameHandle> {
  const [Phaser, { buildPhaserConfig }] = await Promise.all([
    import("phaser"),
    import("./config"),
  ]);

  const bus = new GameBus();
  const controls = createControlState();
  const game = new Phaser.Game(buildPhaserConfig(parent, spec));
  game.registry.set("spec", spec);
  game.registry.set("bus", bus);
  game.registry.set("controls", controls);

  // The keyboard manager listens on `window`, so without this, WASD / space /
  // R / arrows fire into the game (and get preventDefault'd, breaking typing)
  // even while the user is focused on a text field like the publish form.
  const syncKeyboardEnabled = () => {
    const keyboard = game.input.keyboard;
    if (!keyboard) return;
    keyboard.enabled = !isTextEntryTarget(document.activeElement);
  };
  syncKeyboardEnabled();
  document.addEventListener("focusin", syncKeyboardEnabled);
  document.addEventListener("focusout", syncKeyboardEnabled);

  return {
    game,
    bus,
    controls,
    destroy: () => {
      document.removeEventListener("focusin", syncKeyboardEnabled);
      document.removeEventListener("focusout", syncKeyboardEnabled);
      bus.clear();
      game.destroy(true);
    },
  };
}
