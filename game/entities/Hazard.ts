import Phaser from "phaser";
import type { GameEntitySpec } from "@/game/types";
import type { ThemePalette } from "@/game/theme";
import type { StaticRect } from "./Platform";

export function createHazard(
  scene: Phaser.Scene,
  entity: GameEntitySpec,
  palette: ThemePalette,
): StaticRect {
  const rect = scene.add.rectangle(
    entity.bounds.x + entity.bounds.width / 2,
    entity.bounds.y + entity.bounds.height / 2,
    entity.bounds.width,
    entity.bounds.height,
    palette.hazard,
  );
  rect.setStrokeStyle(3, 0x000000, 0.4);
  scene.physics.add.existing(rect, true);

  scene.tweens.add({
    targets: rect,
    alpha: 0.65,
    duration: 500,
    yoyo: true,
    repeat: -1,
  });

  return rect as StaticRect;
}
