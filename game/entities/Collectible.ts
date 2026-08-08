import * as Phaser from "phaser";
import type { GameEntitySpec } from "@/game/types";
import type { ThemePalette } from "@/game/theme";
import { animateEntityArt, attachEntityArt } from "@/game/art/entityArt";
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
  scene.physics.add.existing(rect, true);
  const collectible = attachEntityArt(scene, rect as StaticRect, entity, palette);
  animateEntityArt(scene, collectible, entity.mechanic);
  return collectible;
}
