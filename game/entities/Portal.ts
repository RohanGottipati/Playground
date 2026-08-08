import * as Phaser from "phaser";
import type { GameEntitySpec } from "@/game/types";
import type { ThemePalette } from "@/game/theme";
import type { StaticRect } from "./Platform";

export function createPortal(
  scene: Phaser.Scene,
  entity: GameEntitySpec,
  palette: ThemePalette,
): StaticRect {
  const rect = scene.add.rectangle(
    entity.bounds.x + entity.bounds.width / 2,
    entity.bounds.y + entity.bounds.height / 2,
    entity.bounds.width,
    entity.bounds.height,
    palette.portal,
  );
  rect.setStrokeStyle(3, 0xffffff, 0.5);
  scene.physics.add.existing(rect, true);

  scene.tweens.add({
    targets: rect,
    scaleX: 0.8,
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  return rect as StaticRect;
}
