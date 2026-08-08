import * as Phaser from "phaser";
import type { GameEntitySpec } from "@/game/types";
import type { ThemePalette } from "@/game/theme";
import {
  animateEntityArt,
  attachEntityArt,
  syncEntityArt,
  type EntityArtCarrier,
} from "@/game/art/entityArt";

export type StaticRect = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.StaticBody;
} & EntityArtCarrier;

export type MovingPlatform = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.Body;
} & EntityArtCarrier;

function centered(entity: GameEntitySpec) {
  return {
    x: entity.bounds.x + entity.bounds.width / 2,
    y: entity.bounds.y + entity.bounds.height / 2,
  };
}

export function createStaticPlatform(
  scene: Phaser.Scene,
  entity: GameEntitySpec,
  palette: ThemePalette,
): StaticRect {
  const { x, y } = centered(entity);
  const rect = scene.add.rectangle(
    x,
    y,
    entity.bounds.width,
    entity.bounds.height,
    entity.metadata?.role === "helper" ? palette.movingPlatform : palette.platform,
  );
  scene.physics.add.existing(rect, true);
  return attachEntityArt(scene, rect as StaticRect, entity, palette);
}

export function createMovingPlatform(
  scene: Phaser.Scene,
  entity: GameEntitySpec,
  palette: ThemePalette,
): MovingPlatform {
  const { x, y } = centered(entity);
  const rect = scene.add.rectangle(
    x,
    y,
    entity.bounds.width,
    entity.bounds.height,
    palette.movingPlatform,
  );
  scene.physics.add.existing(rect);

  const platform = attachEntityArt(scene, rect as MovingPlatform, entity, palette);
  platform.body.setAllowGravity(false);
  platform.body.setImmovable(true);

  const movement = entity.movement ?? { axis: "x" as const, distance: 120, speed: 60 };
  const from = movement.axis === "x" ? x : y;
  const to = from + movement.distance;
  const durationMs = (movement.distance / movement.speed) * 1000;

  scene.tweens.add({
    targets: platform,
    [movement.axis]: to,
    duration: durationMs,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
    onUpdate: () => {
      platform.body.updateFromGameObject();
      syncEntityArt(platform);
    },
  });

  return platform;
}

export function createBouncePad(
  scene: Phaser.Scene,
  entity: GameEntitySpec,
  palette: ThemePalette,
): StaticRect {
  const { x, y } = centered(entity);
  const rect = scene.add.rectangle(
    x,
    y,
    entity.bounds.width,
    entity.bounds.height,
    palette.bouncePad,
  );
  scene.physics.add.existing(rect, true);
  const pad = attachEntityArt(scene, rect as StaticRect, entity, palette);
  animateEntityArt(scene, pad, entity.mechanic);
  return pad;
}
