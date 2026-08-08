import * as Phaser from "phaser";
import type { GameEntitySpec } from "@/game/types";
import type { ThemePalette } from "@/game/theme";

export type StaticRect = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.StaticBody;
};

export type MovingPlatform = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.Body;
};

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
  rect.setStrokeStyle(3, 0x000000, 0.35);
  scene.physics.add.existing(rect, true);
  return rect as StaticRect;
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
  rect.setStrokeStyle(3, 0x000000, 0.35);
  scene.physics.add.existing(rect);

  const platform = rect as MovingPlatform;
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
  rect.setStrokeStyle(3, 0x000000, 0.35);
  scene.physics.add.existing(rect, true);

  scene.tweens.add({
    targets: rect,
    scaleY: 0.7,
    duration: 700,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  return rect as StaticRect;
}
