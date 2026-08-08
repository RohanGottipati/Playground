import Phaser from "phaser";
import { MAX_FALL_SPEED, PLAYER_HEIGHT, PLAYER_WIDTH } from "@/game/constants";
import type { GameSpec } from "@/game/types";
import type { ThemePalette } from "@/game/theme";

export type PlayerObject = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.Body;
};

export function createPlayer(
  scene: Phaser.Scene,
  spec: GameSpec,
  palette: ThemePalette,
): PlayerObject {
  const player = scene.add.rectangle(
    spec.player.spawnX,
    spec.player.spawnY,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    palette.player,
  );
  player.setStrokeStyle(2, 0x000000, 0.25);
  scene.physics.add.existing(player);

  const object = player as PlayerObject;
  object.body.setCollideWorldBounds(true);
  object.body.setMaxVelocity(spec.player.moveSpeed * 2.2, MAX_FALL_SPEED);
  object.setDepth(10);
  return object;
}

export function respawnPlayer(player: PlayerObject, spec: GameSpec): void {
  player.body.reset(spec.player.spawnX, spec.player.spawnY);
  player.setAlpha(1);
}
