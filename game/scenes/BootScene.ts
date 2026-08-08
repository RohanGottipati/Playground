import * as Phaser from "phaser";
import type { GameBus } from "@/game/bus";
import { collectSafetyIssues } from "@/game/generation/runtimeSafety";
import type { GameSpec } from "@/game/types";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    const spec = this.registry.get("spec") as GameSpec | undefined;
    const bus = this.registry.get("bus") as GameBus | undefined;

    if (!spec) {
      bus?.emit("error", { message: "This game could not load correctly." });
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
