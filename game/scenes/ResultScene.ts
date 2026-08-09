import * as Phaser from "phaser";
import type { ControlState, RunResult } from "@/game/bus";
import { restartCompletedRun } from "@/game/restartCompletedRun";
import { paletteForSpec } from "@/game/theme";
import type { GameSpec } from "@/game/types";

export class ResultScene extends Phaser.Scene {
  private restarting = false;

  constructor() {
    super("ResultScene");
  }

  create(data: RunResult) {
    this.restarting = false;
    const spec = this.registry.get("spec") as GameSpec;
    const palette = paletteForSpec(spec);
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

    this.input.keyboard?.once("keydown-R", () => this.restartCompletedRun());
  }

  update() {
    const controls = this.registry.get("controls") as ControlState;
    if (!controls?.restart) return;
    controls.restart = false;
    this.restartCompletedRun();
  }

  private restartCompletedRun() {
    if (this.restarting) return;
    this.restarting = true;
    restartCompletedRun(this);
  }
}
