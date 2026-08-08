import Phaser from "phaser";
import { GRAVITY_Y } from "./constants";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { ResultScene } from "./scenes/ResultScene";
import type { GameSpec } from "./types";

export function buildPhaserConfig(
  parent: HTMLElement,
  spec: GameSpec,
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
    audio: { disableWebAudio: false, noAudio: true },
    banner: false,
  };
}
