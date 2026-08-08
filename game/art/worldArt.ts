import * as Phaser from "phaser";
import type { ThemePalette } from "@/game/theme";
import type { GameSpec } from "@/game/types";

const INK = 0x1b1b23;
const PAPER = 0xf8f4e8;

function colorChannel(color: number, shift: number): number {
  return (color >> shift) & 0xff;
}

function mix(from: number, to: number, amount: number): number {
  const t = Phaser.Math.Clamp(amount, 0, 1);
  const r = Math.round(colorChannel(from, 16) + (colorChannel(to, 16) - colorChannel(from, 16)) * t);
  const g = Math.round(colorChannel(from, 8) + (colorChannel(to, 8) - colorChannel(from, 8)) * t);
  const b = Math.round(colorChannel(from, 0) + (colorChannel(to, 0) - colorChannel(from, 0)) * t);
  return (r << 16) | (g << 8) | b;
}

function drawDefaultBackdrop(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  graphics.lineStyle(3, palette.platform, 0.08);
  for (let x = 0; x <= width; x += 90) graphics.lineBetween(x, height * 0.48, x, height);
  for (let y = height * 0.52; y <= height; y += 70) graphics.lineBetween(0, y, width, y);
  graphics.fillStyle(palette.platform, 0.09);
  for (let index = 0; index < 8; index += 1) {
    const cabinetX = 70 + index * 210;
    graphics.fillRoundedRect(cabinetX, height * 0.52 - (index % 3) * 18, 120, height * 0.34, 12);
    graphics.fillStyle(palette.collectible, 0.09);
    graphics.fillRoundedRect(cabinetX + 20, height * 0.58 - (index % 3) * 18, 80, 58, 8);
    graphics.fillStyle(palette.platform, 0.09);
  }
}

function drawSpaceBackdrop(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  for (let index = 0; index < 48; index += 1) {
    const x = (index * 137 + 41) % width;
    const y = (index * 83 + 27) % Math.round(height * 0.72);
    const radius = index % 5 === 0 ? 2.5 : 1.3;
    graphics.fillStyle(index % 4 === 0 ? palette.collectible : PAPER, 0.45 + (index % 3) * 0.15);
    graphics.fillCircle(x, y, radius);
  }
  graphics.fillStyle(palette.goal, 0.12);
  graphics.fillCircle(width * 0.78, height * 0.18, 94);
  graphics.lineStyle(10, palette.goal, 0.08);
  graphics.strokeEllipse(width * 0.78, height * 0.18, 250, 54);
  graphics.fillStyle(palette.platform, 0.1);
  graphics.fillTriangle(0, height * 0.78, width * 0.22, height * 0.47, width * 0.45, height * 0.78);
  graphics.fillTriangle(width * 0.32, height * 0.78, width * 0.58, height * 0.53, width * 0.82, height * 0.78);
}

function drawForestBackdrop(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  graphics.fillStyle(mix(palette.backgroundAccent, palette.platform, 0.2), 0.42);
  graphics.fillEllipse(width * 0.25, height * 0.74, width * 0.7, height * 0.54);
  graphics.fillEllipse(width * 0.73, height * 0.72, width * 0.82, height * 0.5);
  for (let index = 0; index < 16; index += 1) {
    const x = index * 115 - 30;
    const treeHeight = 135 + (index % 4) * 26;
    graphics.fillStyle(mix(palette.ground, INK, 0.18), 0.42);
    graphics.fillRect(x + 27, height * 0.77 - treeHeight * 0.38, 14, treeHeight * 0.38);
    graphics.fillStyle(mix(palette.platform, 0x16a34a, 0.45), 0.26);
    graphics.fillCircle(x + 34, height * 0.77 - treeHeight * 0.65, treeHeight * 0.22);
    graphics.fillCircle(x + 12, height * 0.77 - treeHeight * 0.54, treeHeight * 0.16);
    graphics.fillCircle(x + 58, height * 0.77 - treeHeight * 0.54, treeHeight * 0.16);
  }
}

function drawFactoryBackdrop(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  graphics.fillStyle(palette.platform, 0.1);
  for (let index = 0; index < 12; index += 1) {
    const buildingWidth = 100 + (index % 3) * 24;
    const buildingHeight = 170 + (index % 4) * 45;
    const x = index * 145;
    const y = height * 0.78 - buildingHeight;
    graphics.fillRect(x, y, buildingWidth, buildingHeight);
    graphics.fillStyle(palette.movingPlatform, 0.11);
    for (let row = 0; row < 4; row += 1) {
      graphics.fillRect(x + 18, y + 24 + row * 38, 18, 12);
      graphics.fillRect(x + 54, y + 24 + row * 38, 18, 12);
    }
    graphics.fillStyle(palette.platform, 0.1);
  }
  graphics.lineStyle(18, mix(palette.platform, INK, 0.35), 0.18);
  graphics.lineBetween(0, height * 0.28, width * 0.6, height * 0.28);
  graphics.lineBetween(width * 0.6, height * 0.28, width * 0.6, height * 0.48);
  graphics.lineStyle(3, INK, 0.2);
  graphics.strokeCircle(width * 0.6, height * 0.28, 18);
}

function drawNeonBackdrop(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const horizon = height * 0.56;
  graphics.lineStyle(2, palette.platform, 0.2);
  for (let index = -10; index <= 10; index += 1) {
    graphics.lineBetween(width / 2, horizon, width / 2 + index * 150, height);
  }
  for (let y = horizon; y < height; y += Math.max(22, (y - horizon) * 0.24)) {
    graphics.lineBetween(0, y, width, y);
  }
  graphics.fillStyle(palette.hazard, 0.14);
  for (let index = 0; index < 18; index += 1) {
    const buildingWidth = 58 + (index % 4) * 14;
    const buildingHeight = 90 + (index % 5) * 38;
    graphics.fillRect(index * 92, horizon - buildingHeight, buildingWidth, buildingHeight);
  }
  graphics.lineStyle(5, palette.collectible, 0.16);
  graphics.strokeCircle(width * 0.77, height * 0.2, 72);
}

function drawPaperBackdrop(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  graphics.lineStyle(1, mix(palette.backgroundAccent, 0x6b7280, 0.32), 0.18);
  for (let y = 42; y < height; y += 42) graphics.lineBetween(0, y, width, y);
  graphics.lineStyle(3, 0xef4444, 0.16);
  graphics.lineBetween(110, 0, 110, height);
  graphics.lineStyle(4, palette.platform, 0.12);
  graphics.strokeCircle(width * 0.82, height * 0.18, 64);
  graphics.beginPath();
  graphics.moveTo(width * 0.12, height * 0.56);
  graphics.lineTo(width * 0.24, height * 0.4);
  graphics.lineTo(width * 0.35, height * 0.56);
  graphics.lineTo(width * 0.47, height * 0.38);
  graphics.lineTo(width * 0.6, height * 0.56);
  graphics.strokePath();
}

function drawKitchenBackdrop(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const tileSize = 110;
  graphics.lineStyle(3, mix(palette.platform, PAPER, 0.2), 0.08);
  for (let x = 0; x <= width; x += tileSize) graphics.lineBetween(x, 0, x, height * 0.68);
  for (let y = 0; y <= height * 0.68; y += tileSize) graphics.lineBetween(0, y, width, y);
  graphics.fillStyle(palette.platform, 0.08);
  graphics.fillRect(0, height * 0.58, width, height * 0.2);
  for (let index = 0; index < 9; index += 1) {
    const x = 90 + index * 185;
    graphics.lineStyle(5, mix(palette.platform, PAPER, 0.22), 0.15);
    graphics.lineBetween(x, 0, x, 78 + (index % 2) * 18);
    graphics.strokeCircle(x, 110 + (index % 2) * 18, 28);
  }
}

/** Creates deterministic, lightweight parallax scenery for the selected theme. */
export function createWorldBackdrop(
  scene: Phaser.Scene,
  spec: GameSpec,
  palette: ThemePalette,
): void {
  const { width, height } = spec.world;
  const wash = scene.add.rectangle(width / 2, height / 2, width, height, palette.backgroundAccent, 0.38);
  wash.setDepth(-30);
  wash.setScrollFactor(0.08);

  const graphics = scene.add.graphics();
  graphics.setDepth(-29);
  graphics.setScrollFactor(0.22);

  switch (spec.theme) {
    case "space":
      drawSpaceBackdrop(graphics, width, height, palette);
      break;
    case "forest":
      drawForestBackdrop(graphics, width, height, palette);
      break;
    case "factory":
      drawFactoryBackdrop(graphics, width, height, palette);
      break;
    case "neon":
      drawNeonBackdrop(graphics, width, height, palette);
      break;
    case "paper":
      drawPaperBackdrop(graphics, width, height, palette);
      break;
    case "kitchen":
      drawKitchenBackdrop(graphics, width, height, palette);
      break;
    default:
      drawDefaultBackdrop(graphics, width, height, palette);
      break;
  }
}

/** Illustrated ground drawn independently from the authoritative physics body. */
export function createGroundArt(
  scene: Phaser.Scene,
  width: number,
  top: number,
  height: number,
  theme: string,
  palette: ThemePalette,
): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics();
  graphics.setDepth(2);
  graphics.fillStyle(palette.ground, 1);
  graphics.fillRect(0, top, width, height);
  graphics.lineStyle(4, INK, 0.72);
  graphics.lineBetween(0, top, width, top);

  if (theme === "forest") {
    graphics.fillStyle(mix(palette.platform, 0x4ade80, 0.6), 1);
    graphics.fillRect(0, top, width, 14);
    graphics.lineStyle(3, mix(palette.ground, INK, 0.3), 0.5);
    for (let x = 20; x < width; x += 46) {
      graphics.lineBetween(x, top + 28, x + 8, top + 38);
      graphics.fillCircle(x + 20, top + 48 + (x % 3) * 4, 3);
    }
  } else if (theme === "factory" || theme === "neon" || theme === "space") {
    graphics.fillStyle(mix(palette.ground, palette.movingPlatform, 0.28), 1);
    graphics.fillRect(0, top, width, 13);
    graphics.lineStyle(2, mix(palette.ground, PAPER, 0.25), 0.35);
    for (let x = 0; x < width; x += 90) {
      graphics.strokeRect(x + 4, top + 18, 82, height - 24);
      graphics.fillCircle(x + 14, top + 28, 3);
      graphics.fillCircle(x + 76, top + 28, 3);
    }
  } else if (theme === "paper") {
    graphics.fillStyle(mix(palette.ground, PAPER, 0.28), 1);
    graphics.fillRect(0, top, width, 12);
    graphics.lineStyle(2, INK, 0.16);
    for (let x = 0; x < width; x += 34) graphics.lineBetween(x, top + 16, x + 18, top + height - 5);
  } else if (theme === "kitchen") {
    graphics.fillStyle(mix(palette.ground, PAPER, 0.36), 1);
    graphics.fillRect(0, top, width, 16);
    graphics.lineStyle(2, INK, 0.22);
    for (let x = 0; x < width; x += 130) graphics.lineBetween(x, top + 16, x, top + height);
  } else {
    graphics.fillStyle(mix(palette.ground, palette.platform, 0.32), 1);
    graphics.fillRect(0, top, width, 13);
    graphics.fillStyle(mix(palette.ground, INK, 0.22), 0.7);
    for (let x = 24; x < width; x += 76) graphics.fillCircle(x, top + 36 + (x % 4) * 5, 3);
  }

  return graphics;
}
