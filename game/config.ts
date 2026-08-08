import * as Phaser from "phaser";
import type { ControlState, GameBus } from "./bus";
import { GRAVITY_Y } from "./constants";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { ResultScene } from "./scenes/ResultScene";
import type { GameSpec } from "./types";

export function buildPhaserConfig(
  parent: HTMLElement,
  spec: GameSpec,
  bus: GameBus,
  controls: ControlState,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: spec.world.width,
    height: spec.world.height,
    backgroundColor: "#11131c",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: spec.world.gravityY || GRAVITY_Y },
        debug: false,
      },
    },
    scene: [BootScene, GameScene, ResultScene],
    callbacks: {
      preBoot: (game) => {
        game.registry.set("spec", spec);
        game.registry.set("bus", bus);
        game.registry.set("controls", controls);
      },
    },
    audio: { disableWebAudio: false, noAudio: true },
    banner: false,
  };
}
