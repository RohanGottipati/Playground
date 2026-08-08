import * as Phaser from "phaser";
import { MAX_FALL_SPEED, PLAYER_HEIGHT, PLAYER_WIDTH } from "@/game/constants";
import type { GameSpec } from "@/game/types";
import type { ThemePalette } from "@/game/theme";
import {
  createHeroArt,
  placeHeroArt,
  updateHeroArt,
  type HeroArt,
} from "@/game/art/playerArt";

export type PlayerObject = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.Body;
  art: HeroArt;
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
  scene.physics.add.existing(player);

  const object = player as PlayerObject;
  object.setVisible(false);
  object.art = createHeroArt(scene, object.x, object.y, palette);
  object.body.setCollideWorldBounds(true);
  object.body.setMaxVelocity(spec.player.moveSpeed * 2.2, MAX_FALL_SPEED);
  object.setDepth(10);
  return object;
}

export function respawnPlayer(player: PlayerObject, spec: GameSpec): void {
  player.body.reset(spec.player.spawnX, spec.player.spawnY);
  player.setAlpha(1);
  placeHeroArt(player.art, spec.player.spawnX, spec.player.spawnY);
}

export function updatePlayerArt(
  player: PlayerObject,
  grounded: boolean,
  time: number,
): void {
  updateHeroArt(
    player.art,
    player.x,
    player.y,
    player.body.velocity.x,
    player.body.velocity.y,
    grounded,
    time,
  );
}
