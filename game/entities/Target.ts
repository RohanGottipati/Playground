import * as Phaser from "phaser";
import type { GameEntitySpec } from "@/game/types";
import type { ThemePalette } from "@/game/theme";
import { animateEntityArt, attachEntityArt } from "@/game/art/entityArt";
import type { StaticRect } from "./Platform";

export type TargetRect = StaticRect & { destroyed?: boolean };

/** Hovering drone destroyed by projectiles; lethal to touch. */
export function createTarget(
  scene: Phaser.Scene,
  entity: GameEntitySpec,
  palette: ThemePalette,
): TargetRect {
  const rect = scene.add.rectangle(
    entity.bounds.x + entity.bounds.width / 2,
    entity.bounds.y + entity.bounds.height / 2,
    entity.bounds.width,
    entity.bounds.height,
    palette.hazard,
  );
  scene.physics.add.existing(rect, true);
  const target = attachEntityArt(scene, rect as TargetRect, entity, palette);
  animateEntityArt(scene, target, entity.mechanic);
  return target;
}
