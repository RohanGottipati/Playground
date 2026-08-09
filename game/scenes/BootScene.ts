import * as Phaser from "phaser";
import type { GameBus } from "@/game/bus";
import { resolveEntityVisual } from "@/game/art/selectVisual";
import { collectSafetyIssues } from "@/game/generation/runtimeSafety";
import type { GameSpec } from "@/game/types";
import {
  hasMagicPatternComponent,
  magicPatternSpriteUrl,
  magicPatternTextureKey,
} from "@/magic-patterns/registry";

export class BootScene extends Phaser.Scene {
  private failedAssets: string[] = [];

  constructor() {
    super("BootScene");
  }

  preload() {
    this.failedAssets = [];
    this.load.on(
      Phaser.Loader.Events.FILE_LOAD_ERROR,
      (file: Phaser.Loader.File) => {
        this.failedAssets.push(file.src);
      },
    );

    const spec = this.registry.get("spec") as GameSpec | undefined;
    if (!spec) return;

    const componentIds = new Set(
      spec.entities.map((entity) => resolveEntityVisual(entity).componentId),
    );
    if (spec.projectile?.componentId) {
      componentIds.add(spec.projectile.componentId);
    }
    for (const componentId of spec.skyfall?.componentIds ?? []) {
      componentIds.add(componentId);
    }
    for (const componentId of spec.gauntlet?.ammoComponentIds ?? []) {
      componentIds.add(componentId);
    }
    for (const componentId of componentIds) {
      if (!hasMagicPatternComponent(componentId)) continue;
      const textureKey = magicPatternTextureKey(componentId);
      if (this.textures.exists(textureKey)) continue;
      this.load.svg(textureKey, magicPatternSpriteUrl(componentId), {
        width: 512,
        height: 512,
      });
    }
  }

  create() {
    const spec = this.registry.get("spec") as GameSpec | undefined;
    const bus = this.registry.get("bus") as GameBus | undefined;

    if (!spec) {
      bus?.emit("error", { message: "This game could not load correctly." });
      return;
    }

    if (this.failedAssets.length > 0) {
      const failed = [...new Set(this.failedAssets)];
      console.error("game assets failed to load", failed);
      bus?.emit("error", {
        message:
          "This game's artwork could not load. Refresh the page or return to the arcade.",
      });
      return;
    }

    const issues = collectSafetyIssues(spec);
    if (issues.length > 0) {
      bus?.emit("error", {
        message: "This game could not load correctly. Return to the arcade.",
      });
      console.error("game spec failed runtime safety", issues);
      return;
    }

    this.scene.start("GameScene");
  }
}
