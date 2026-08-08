import * as Phaser from "phaser";
import type { RunResult } from "@/game/bus";
import { paletteForTheme } from "@/game/theme";
import type { GameSpec } from "@/game/types";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(data: RunResult) {
    const spec = this.registry.get("spec") as GameSpec;
    const palette = paletteForTheme(spec.theme);
    const { width, height } = this.scale.gameSize;

    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      palette.background,
    );
    overlay.setAlpha(0.82);
    overlay.setScrollFactor(0);

    const seconds = (data.elapsedMs / 1000).toFixed(2);
    const lines = [
      "LEVEL COMPLETE",
      `Time ${seconds}s`,
      `Deaths ${data.deaths}`,
      `Collected ${data.collectibles}/${data.totalCollectibles}`,
      "Press R to play again",
    ];

    const text = this.add.text(width / 2, height / 2, lines.join("\n"), {
      fontFamily: "monospace",
      fontSize: "26px",
      color: palette.label,
      align: "center",
      lineSpacing: 10,
    });
    text.setOrigin(0.5, 0.5);
    text.setScrollFactor(0);
  }
}
