import * as Phaser from "phaser";
import type { GameEntitySpec } from "@/game/types";
import type { ThemePalette } from "@/game/theme";
import type { StaticRect } from "./Platform";

export function createCollectible(
  scene: Phaser.Scene,
  entity: GameEntitySpec,
  palette: ThemePalette,
): StaticRect {
  const rect = scene.add.rectangle(
    entity.bounds.x + entity.bounds.width / 2,
    entity.bounds.y + entity.bounds.height / 2,
    entity.bounds.width,
    entity.bounds.height,
    palette.collectible,
  );
  rect.setStrokeStyle(2, 0x000000, 0.35);
  rect.setAngle(45);
  scene.physics.add.existing(rect, true);

  scene.tweens.add({
    targets: rect,
    y: rect.y - 8,
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  return rect as StaticRect;
}
