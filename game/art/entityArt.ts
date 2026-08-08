import * as Phaser from "phaser";
import type { ThemePalette } from "@/game/theme";
import type {
  EntityVisualKind,
  GameEntitySpec,
} from "@/game/types";
import { resolveEntityVisual } from "./selectVisual";
import { drawObjectComponentArt } from "./objectComponentArt";

const INK = 0x1b1b23;
const PAPER = 0xf8f4e8;
const SKY = 0x38bdf8;
const AMBER = 0xfbbf24;
const RED = 0xef4444;
const GREEN = 0x4ade80;
const VIOLET = 0x8b5cf6;

export type EntityArtCarrier = {
  art: Phaser.GameObjects.Container;
  artLabel?: Phaser.GameObjects.Text;
  visualKind: EntityVisualKind;
  componentId?: string;
  usesExactObjectArt: boolean;
};

type RectangleBody = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;
};

function channel(color: number, shift: number): number {
  return (color >> shift) & 0xff;
}

/** Small color blend helper so all drawings inherit the generated theme. */
function mix(from: number, to: number, amount: number): number {
  const t = Phaser.Math.Clamp(amount, 0, 1);
  const r = Math.round(channel(from, 16) + (channel(to, 16) - channel(from, 16)) * t);
  const g = Math.round(channel(from, 8) + (channel(to, 8) - channel(from, 8)) * t);
  const b = Math.round(channel(from, 0) + (channel(to, 0) - channel(from, 0)) * t);
  return (r << 16) | (g << 8) | b;
}

function strokeWidth(width: number, height: number): number {
  return Phaser.Math.Clamp(Math.min(width, height) * 0.09, 2, 4);
}

function rounded(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: number,
  lineWidth: number,
): void {
  graphics.fillStyle(fill, 1);
  graphics.fillRoundedRect(x, y, width, height, radius);
  graphics.lineStyle(lineWidth, INK, 0.95);
  graphics.strokeRoundedRect(x, y, width, height, radius);
}

function drawBook(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const x = -width / 2;
  const y = -height / 2;
  const line = strokeWidth(width, height);
  graphics.fillStyle(INK, 0.18);
  graphics.fillEllipse(0, height * 0.42, width * 0.92, Math.max(5, height * 0.2));
  rounded(graphics, x, y, width, height * 0.88, Math.min(9, height * 0.18), palette.platform, line);
  rounded(
    graphics,
    x + line * 1.5,
    y + height * 0.16,
    width - line * 3,
    height * 0.56,
    Math.min(5, height * 0.1),
    mix(PAPER, palette.platform, 0.12),
    Math.max(1.5, line * 0.6),
  );
  graphics.lineStyle(Math.max(1, line * 0.45), mix(INK, PAPER, 0.45), 0.55);
  for (let index = 1; index <= 2; index += 1) {
    graphics.lineBetween(
      x + width * 0.18,
      y + height * (0.3 + index * 0.14),
      x + width * 0.78,
      y + height * (0.3 + index * 0.14),
    );
  }
  graphics.fillStyle(mix(palette.platform, INK, 0.24), 1);
  graphics.fillRoundedRect(x, y + height * 0.72, width, height * 0.16, 3);
}

function drawPencil(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
): void {
  const x = -width / 2;
  const y = -height / 2;
  const bodyHeight = Math.max(12, height * 0.68);
  const top = -bodyHeight / 2;
  const tip = Math.min(width * 0.2, Math.max(22, height * 0.8));
  const eraser = Math.min(width * 0.15, Math.max(18, height * 0.65));
  const line = strokeWidth(width, bodyHeight);

  graphics.fillStyle(INK, 0.18);
  graphics.fillEllipse(0, y + height * 0.82, width * 0.92, Math.max(5, height * 0.16));
  rounded(graphics, x + eraser, top, width - eraser - tip, bodyHeight, 3, AMBER, line);
  graphics.fillStyle(0xf4c9a8, 1);
  graphics.lineStyle(line, INK, 0.95);
  graphics.fillTriangle(width / 2 - tip, top, width / 2, 0, width / 2 - tip, top + bodyHeight);
  graphics.strokeTriangle(width / 2 - tip, top, width / 2, 0, width / 2 - tip, top + bodyHeight);
  graphics.fillStyle(INK, 1);
  graphics.fillTriangle(width / 2 - tip * 0.24, -bodyHeight * 0.12, width / 2, 0, width / 2 - tip * 0.24, bodyHeight * 0.12);
  rounded(graphics, x, top, eraser, bodyHeight, 3, 0xf472b6, line);
  graphics.lineStyle(Math.max(1, line * 0.5), 0xfef3c7, 0.7);
  graphics.lineBetween(x + eraser + width * 0.08, top + bodyHeight * 0.28, width / 2 - tip, top + bodyHeight * 0.28);
}

function drawBottle(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const bodyWidth = width * 0.72;
  const neckWidth = width * 0.34;
  const top = -height / 2;
  const shoulder = top + height * 0.28;
  const bottom = height / 2;
  const points = [
    { x: -neckWidth / 2, y: top + height * 0.1 },
    { x: -neckWidth / 2, y: shoulder - height * 0.08 },
    { x: -bodyWidth / 2, y: shoulder },
    { x: -bodyWidth / 2, y: bottom - height * 0.1 },
    { x: -bodyWidth * 0.38, y: bottom },
    { x: bodyWidth * 0.38, y: bottom },
    { x: bodyWidth / 2, y: bottom - height * 0.1 },
    { x: bodyWidth / 2, y: shoulder },
    { x: neckWidth / 2, y: shoulder - height * 0.08 },
    { x: neckWidth / 2, y: top + height * 0.1 },
  ];
  graphics.fillStyle(INK, 0.16);
  graphics.fillEllipse(0, bottom + 3, bodyWidth * 1.04, Math.max(5, height * 0.06));
  graphics.fillStyle(mix(palette.platform, SKY, 0.28), 1);
  graphics.lineStyle(line, INK, 0.95);
  graphics.fillPoints(points, true);
  graphics.strokePoints(points, true);
  rounded(
    graphics,
    -neckWidth * 0.58,
    top,
    neckWidth * 1.16,
    height * 0.12,
    3,
    mix(palette.platform, INK, 0.18),
    line,
  );
  graphics.fillStyle(PAPER, 0.82);
  graphics.fillRoundedRect(-bodyWidth * 0.34, -height * 0.04, bodyWidth * 0.68, height * 0.28, 4);
  graphics.lineStyle(Math.max(1.5, line * 0.55), INK, 0.65);
  graphics.strokeRoundedRect(-bodyWidth * 0.34, -height * 0.04, bodyWidth * 0.68, height * 0.28, 4);
  graphics.lineStyle(Math.max(2, line * 0.8), 0xffffff, 0.45);
  graphics.lineBetween(-bodyWidth * 0.25, shoulder + 3, -bodyWidth * 0.25, bottom - height * 0.16);
}

function drawCrate(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const x = -width / 2;
  const y = -height / 2;
  rounded(graphics, x, y, width, height, Math.min(7, height * 0.12), mix(palette.platform, 0xb45309, 0.55), line);
  rounded(
    graphics,
    x + line * 2,
    y + line * 2,
    width - line * 4,
    height - line * 4,
    3,
    mix(palette.platform, 0xd97706, 0.65),
    Math.max(1.5, line * 0.55),
  );
  graphics.lineStyle(Math.max(2, line * 0.8), INK, 0.8);
  graphics.lineBetween(x + width * 0.18, y + height * 0.2, x + width * 0.82, y + height * 0.8);
  graphics.lineBetween(x + width * 0.82, y + height * 0.2, x + width * 0.18, y + height * 0.8);
}

function drawHelper(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const x = -width / 2;
  const y = -height / 2;
  graphics.fillStyle(palette.movingPlatform, 0.18);
  graphics.fillRoundedRect(x - 7, y - 6, width + 14, height + 12, 10);
  rounded(graphics, x, y, width, height, Math.min(8, height * 0.25), palette.movingPlatform, line);
  graphics.fillStyle(mix(palette.movingPlatform, PAPER, 0.45), 1);
  graphics.fillRoundedRect(x + line, y + line, width - line * 2, Math.max(4, height * 0.22), 3);
  graphics.lineStyle(Math.max(2, line * 0.65), INK, 0.55);
  for (let offset = width * 0.2; offset < width * 0.9; offset += Math.max(20, width * 0.25)) {
    graphics.lineBetween(x + offset, y + height * 0.68, x + offset + 6, y + height * 0.84);
  }
}

function drawMovingPlatform(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const x = -width / 2;
  const y = -height / 2;
  graphics.lineStyle(Math.max(2, line * 0.7), mix(palette.movingPlatform, PAPER, 0.2), 0.65);
  for (let offset = 0; offset < width; offset += 18) {
    graphics.lineBetween(x + offset, y + height * 0.95, Math.min(x + offset + 9, width / 2), y + height * 0.95);
  }
  rounded(graphics, x, y, width, height * 0.72, Math.min(8, height * 0.2), palette.movingPlatform, line);
  graphics.fillStyle(mix(palette.movingPlatform, PAPER, 0.42), 1);
  graphics.fillRoundedRect(x + line, y + line, width - line * 2, Math.max(4, height * 0.2), 3);
  for (const wheelX of [-width * 0.28, width * 0.28]) {
    graphics.fillStyle(mix(palette.movingPlatform, INK, 0.35), 1);
    graphics.fillCircle(wheelX, y + height * 0.78, Math.max(4, height * 0.12));
    graphics.lineStyle(Math.max(1.5, line * 0.45), INK, 0.9);
    graphics.strokeCircle(wheelX, y + height * 0.78, Math.max(4, height * 0.12));
  }
}

function drawBouncePad(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const x = -width / 2;
  const y = -height / 2;
  rounded(graphics, x + width * 0.12, y + height * 0.48, width * 0.76, height * 0.5, 5, mix(palette.bouncePad, INK, 0.45), line);
  graphics.lineStyle(Math.max(2, line * 0.8), mix(PAPER, palette.bouncePad, 0.35), 0.9);
  graphics.beginPath();
  graphics.moveTo(-width * 0.24, y + height * 0.5);
  graphics.lineTo(-width * 0.12, y + height * 0.25);
  graphics.lineTo(0, y + height * 0.5);
  graphics.lineTo(width * 0.12, y + height * 0.25);
  graphics.lineTo(width * 0.24, y + height * 0.5);
  graphics.strokePath();
  rounded(graphics, x, y, width, height * 0.42, Math.min(10, height * 0.2), palette.bouncePad, line);
  graphics.fillStyle(mix(palette.bouncePad, PAPER, 0.48), 1);
  graphics.fillRoundedRect(x + line, y + line, width - line * 2, Math.max(4, height * 0.14), 3);
}

function drawMugBouncer(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const mugWidth = width * 0.68;
  const mugHeight = height * 0.78;
  const x = -mugWidth * 0.55;
  const y = -mugHeight / 2;
  rounded(graphics, x, y, mugWidth, mugHeight, Math.min(10, mugHeight * 0.18), mix(palette.bouncePad, PAPER, 0.25), line);
  graphics.fillStyle(mix(palette.bouncePad, PAPER, 0.48), 1);
  graphics.fillRoundedRect(x + line, y + line, mugWidth - line * 2, mugHeight * 0.18, 4);
  graphics.lineStyle(line, INK, 0.95);
  graphics.strokeEllipse(mugWidth * 0.42, 0, width * 0.32, height * 0.46);
  graphics.lineStyle(Math.max(2, line * 0.65), GREEN, 0.9);
  graphics.lineBetween(-width * 0.16, y - 4, -width * 0.16, y - height * 0.2);
  graphics.lineBetween(0, y - 4, 0, y - height * 0.26);
  graphics.lineBetween(width * 0.16, y - 4, width * 0.16, y - height * 0.2);
}

function drawTrampoline(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
): void {
  const line = strokeWidth(width, height);
  graphics.fillStyle(INK, 0.18);
  graphics.fillEllipse(0, height * 0.44, width * 0.9, Math.max(5, height * 0.12));
  graphics.fillStyle(0x1e293b, 1);
  graphics.lineStyle(line, INK, 0.95);
  graphics.fillEllipse(0, -height * 0.12, width * 0.94, height * 0.48);
  graphics.strokeEllipse(0, -height * 0.12, width * 0.94, height * 0.48);
  graphics.fillStyle(0x0f172a, 1);
  graphics.fillEllipse(0, -height * 0.15, width * 0.72, height * 0.29);
  graphics.lineStyle(Math.max(2, line * 0.8), INK, 0.9);
  for (const leg of [-width * 0.36, -width * 0.13, width * 0.13, width * 0.36]) {
    graphics.lineBetween(leg, height * 0.02, leg * 1.08, height * 0.42);
  }
  graphics.lineStyle(Math.max(2, line * 0.65), GREEN, 1);
  graphics.lineBetween(0, -height * 0.42, -width * 0.08, -height * 0.3);
  graphics.lineBetween(0, -height * 0.42, width * 0.08, -height * 0.3);
}

function drawSpikes(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const count = Phaser.Math.Clamp(Math.round(width / Math.max(18, height * 0.5)), 2, 8);
  const segment = width / count;
  for (let index = 0; index < count; index += 1) {
    const left = -width / 2 + index * segment;
    graphics.fillStyle(mix(palette.hazard, PAPER, 0.62), 1);
    graphics.lineStyle(Math.max(1.5, line * 0.65), INK, 0.95);
    graphics.fillTriangle(left, height * 0.28, left + segment / 2, -height * 0.48, left + segment, height * 0.28);
    graphics.strokeTriangle(left, height * 0.28, left + segment / 2, -height * 0.48, left + segment, height * 0.28);
  }
  rounded(graphics, -width / 2, height * 0.2, width, height * 0.28, 3, mix(palette.hazard, INK, 0.45), line);
}

function drawScissors(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const ring = Math.min(width, height) * 0.2;
  graphics.fillStyle(mix(palette.hazard, RED, 0.4), 1);
  graphics.lineStyle(line, INK, 0.95);
  graphics.fillCircle(-width * 0.24, height * 0.2, ring);
  graphics.strokeCircle(-width * 0.24, height * 0.2, ring);
  graphics.fillCircle(width * 0.24, height * 0.2, ring);
  graphics.strokeCircle(width * 0.24, height * 0.2, ring);
  graphics.fillStyle(INK, 0.55);
  graphics.fillCircle(-width * 0.24, height * 0.2, ring * 0.45);
  graphics.fillCircle(width * 0.24, height * 0.2, ring * 0.45);
  graphics.fillStyle(mix(PAPER, SKY, 0.18), 1);
  graphics.lineStyle(line, INK, 0.95);
  graphics.fillTriangle(-width * 0.12, height * 0.08, -width * 0.42, -height * 0.44, width * 0.04, -height * 0.02);
  graphics.strokeTriangle(-width * 0.12, height * 0.08, -width * 0.42, -height * 0.44, width * 0.04, -height * 0.02);
  graphics.fillTriangle(width * 0.12, height * 0.08, width * 0.42, -height * 0.44, -width * 0.04, -height * 0.02);
  graphics.strokeTriangle(width * 0.12, height * 0.08, width * 0.42, -height * 0.44, -width * 0.04, -height * 0.02);
  graphics.fillStyle(AMBER, 1);
  graphics.fillCircle(0, 0, Math.max(3, line));
  graphics.lineStyle(Math.max(1.5, line * 0.5), INK, 1);
  graphics.strokeCircle(0, 0, Math.max(3, line));
}

function drawSaw(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const radius = Math.min(width, height) * 0.48;
  const points: { x: number; y: number }[] = [];
  for (let index = 0; index < 32; index += 1) {
    const angle = (index / 32) * Math.PI * 2;
    const pointRadius = index % 2 === 0 ? radius : radius * 0.79;
    points.push({ x: Math.cos(angle) * pointRadius, y: Math.sin(angle) * pointRadius });
  }
  graphics.fillStyle(mix(PAPER, palette.hazard, 0.12), 1);
  graphics.lineStyle(line, INK, 0.95);
  graphics.fillPoints(points, true);
  graphics.strokePoints(points, true);
  graphics.fillStyle(mix(palette.hazard, PAPER, 0.22), 1);
  graphics.fillCircle(0, 0, radius * 0.38);
  graphics.lineStyle(Math.max(1.5, line * 0.55), INK, 0.9);
  graphics.strokeCircle(0, 0, radius * 0.38);
  graphics.fillStyle(INK, 0.8);
  graphics.fillCircle(0, 0, radius * 0.12);
}

function drawCoin(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
): void {
  const radius = Math.min(width, height) * 0.46;
  const line = strokeWidth(width, height);
  graphics.fillStyle(AMBER, 1);
  graphics.lineStyle(line, INK, 0.95);
  graphics.fillCircle(0, 0, radius);
  graphics.strokeCircle(0, 0, radius);
  graphics.fillStyle(0xfde047, 1);
  graphics.fillCircle(0, 0, radius * 0.72);
  graphics.lineStyle(Math.max(1.5, line * 0.52), 0xb45309, 0.9);
  graphics.strokeCircle(0, 0, radius * 0.72);
  graphics.lineStyle(Math.max(2, line * 0.9), 0xb45309, 0.95);
  graphics.lineBetween(0, -radius * 0.5, 0, radius * 0.5);
  graphics.lineBetween(-radius * 0.2, -radius * 0.25, radius * 0.2, -radius * 0.25);
  graphics.lineBetween(-radius * 0.2, radius * 0.25, radius * 0.2, radius * 0.25);
}

function drawGem(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const points = [
    { x: -width * 0.27, y: -height * 0.42 },
    { x: width * 0.27, y: -height * 0.42 },
    { x: width * 0.46, y: -height * 0.12 },
    { x: 0, y: height * 0.46 },
    { x: -width * 0.46, y: -height * 0.12 },
  ];
  graphics.fillStyle(mix(palette.collectible, SKY, 0.72), 1);
  graphics.lineStyle(line, INK, 0.95);
  graphics.fillPoints(points, true);
  graphics.strokePoints(points, true);
  graphics.lineStyle(Math.max(1.5, line * 0.5), mix(SKY, INK, 0.28), 0.85);
  graphics.lineBetween(-width * 0.46, -height * 0.12, width * 0.46, -height * 0.12);
  graphics.lineBetween(-width * 0.27, -height * 0.42, 0, height * 0.46);
  graphics.lineBetween(width * 0.27, -height * 0.42, 0, height * 0.46);
}

function drawEraser(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
): void {
  const line = strokeWidth(width, height);
  rounded(graphics, -width * 0.44, -height * 0.32, width * 0.88, height * 0.64, Math.min(8, height * 0.18), 0xf472b6, line);
  graphics.fillStyle(PAPER, 0.92);
  graphics.fillRoundedRect(-width * 0.04, -height * 0.32 + line, width * 0.42, height * 0.64 - line * 2, 4);
  graphics.lineStyle(Math.max(1.5, line * 0.5), INK, 0.65);
  graphics.lineBetween(-width * 0.04, -height * 0.25, -width * 0.04, height * 0.25);
}

function drawKey(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
): void {
  const line = strokeWidth(width, height);
  const ring = Math.min(width, height) * 0.26;
  graphics.lineStyle(Math.max(4, line * 1.8), AMBER, 1);
  graphics.strokeCircle(-width * 0.18, -height * 0.14, ring);
  graphics.lineBetween(-width * 0.02, height * 0.03, width * 0.36, height * 0.4);
  graphics.lineBetween(width * 0.18, height * 0.24, width * 0.3, height * 0.12);
  graphics.lineBetween(width * 0.3, height * 0.35, width * 0.4, height * 0.24);
  graphics.lineStyle(Math.max(1, line * 0.38), INK, 0.8);
  graphics.strokeCircle(-width * 0.18, -height * 0.14, ring * 1.16);
}

function drawBattery(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
): void {
  const line = strokeWidth(width, height);
  rounded(graphics, -width * 0.34, -height * 0.44, width * 0.68, height * 0.88, Math.min(7, width * 0.12), 0x334155, line);
  rounded(graphics, -width * 0.22, -height * 0.3, width * 0.44, height * 0.62, 3, GREEN, Math.max(1.5, line * 0.5));
  graphics.fillStyle(0x475569, 1);
  graphics.fillRoundedRect(-width * 0.12, -height * 0.5, width * 0.24, height * 0.08, 2);
  graphics.lineStyle(Math.max(2, line * 0.72), 0xfef08a, 1);
  graphics.beginPath();
  graphics.moveTo(width * 0.06, -height * 0.2);
  graphics.lineTo(-width * 0.12, 0);
  graphics.lineTo(width * 0.02, 0);
  graphics.lineTo(-width * 0.06, height * 0.2);
  graphics.strokePath();
}

function drawPortal(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  graphics.fillStyle(palette.portal, 0.18);
  graphics.fillEllipse(0, 0, width * 1.18, height * 1.12);
  graphics.fillStyle(mix(palette.portal, VIOLET, 0.35), 1);
  graphics.lineStyle(line, INK, 0.95);
  graphics.fillEllipse(0, 0, width * 0.88, height * 0.94);
  graphics.strokeEllipse(0, 0, width * 0.88, height * 0.94);
  graphics.fillStyle(mix(palette.portal, PAPER, 0.28), 1);
  graphics.fillEllipse(0, 0, width * 0.58, height * 0.72);
  graphics.fillStyle(mix(palette.background, VIOLET, 0.42), 1);
  graphics.fillEllipse(0, 0, width * 0.28, height * 0.46);
  graphics.fillStyle(PAPER, 0.85);
  graphics.fillCircle(-width * 0.42, -height * 0.35, Math.max(2, line * 0.55));
  graphics.fillCircle(width * 0.43, height * 0.27, Math.max(2, line * 0.45));
}

function drawExitDoor(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const line = strokeWidth(width, height);
  const doorWidth = width * 0.84;
  const doorHeight = height * 0.92;
  graphics.fillStyle(palette.goal, 0.18);
  graphics.fillRoundedRect(-width * 0.55, -height * 0.54, width * 1.1, height * 1.08, 14);
  rounded(graphics, -doorWidth / 2, -doorHeight / 2, doorWidth, doorHeight, Math.min(16, doorWidth * 0.32), mix(palette.goal, 0x7c2d12, 0.55), line);
  rounded(
    graphics,
    -doorWidth * 0.34,
    -doorHeight * 0.36,
    doorWidth * 0.68,
    doorHeight * 0.78,
    Math.min(12, doorWidth * 0.25),
    mix(palette.goal, 0xc2410c, 0.56),
    Math.max(1.5, line * 0.52),
  );
  graphics.lineStyle(Math.max(1.5, line * 0.5), mix(palette.goal, PAPER, 0.3), 0.8);
  graphics.lineBetween(0, -doorHeight * 0.35, 0, doorHeight * 0.4);
  graphics.fillStyle(AMBER, 1);
  graphics.fillCircle(doorWidth * 0.18, doorHeight * 0.08, Math.max(3, line));
  graphics.lineStyle(Math.max(1, line * 0.4), INK, 1);
  graphics.strokeCircle(doorWidth * 0.18, doorHeight * 0.08, Math.max(3, line));
  graphics.fillStyle(PAPER, 0.95);
  graphics.fillTriangle(-doorWidth * 0.1, -doorHeight * 0.18, doorWidth * 0.16, -doorHeight * 0.18, doorWidth * 0.03, -doorHeight * 0.02);
}

function drawEntityArt(
  graphics: Phaser.GameObjects.Graphics,
  kind: EntityVisualKind,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  switch (kind) {
    case "book-platform":
      drawBook(graphics, width, height, palette);
      break;
    case "pencil-bridge":
      drawPencil(graphics, width, height);
      break;
    case "bottle-tower":
      drawBottle(graphics, width, height, palette);
      break;
    case "crate-platform":
      drawCrate(graphics, width, height, palette);
      break;
    case "helper-platform":
      drawHelper(graphics, width, height, palette);
      break;
    case "moving-platform":
      drawMovingPlatform(graphics, width, height, palette);
      break;
    case "bounce-pad":
      drawBouncePad(graphics, width, height, palette);
      break;
    case "mug-bouncer":
      drawMugBouncer(graphics, width, height, palette);
      break;
    case "trampoline":
      drawTrampoline(graphics, width, height);
      break;
    case "spike-strip":
      drawSpikes(graphics, width, height, palette);
      break;
    case "scissors":
      drawScissors(graphics, width, height, palette);
      break;
    case "saw-blade":
      drawSaw(graphics, width, height, palette);
      break;
    case "coin":
      drawCoin(graphics, width, height);
      break;
    case "gem":
      drawGem(graphics, width, height, palette);
      break;
    case "eraser":
      drawEraser(graphics, width, height);
      break;
    case "key":
      drawKey(graphics, width, height);
      break;
    case "battery":
      drawBattery(graphics, width, height);
      break;
    case "portal-gate":
      drawPortal(graphics, width, height, palette);
      break;
    case "exit-door":
      drawExitDoor(graphics, width, height, palette);
      break;
  }
}

export function attachEntityArt<T extends RectangleBody>(
  scene: Phaser.Scene,
  bodyObject: T,
  entity: GameEntitySpec,
  palette: ThemePalette,
): T & EntityArtCarrier {
  const visual = resolveEntityVisual(entity);
  const art = scene.add.container(bodyObject.x, bodyObject.y);
  const graphics = scene.add.graphics();
  const componentLabel = drawObjectComponentArt(
    scene,
    graphics,
    visual.componentId,
    bodyObject.width,
    bodyObject.height,
    palette,
  );
  if (!componentLabel) {
    drawEntityArt(graphics, visual.kind, bodyObject.width, bodyObject.height, palette);
  }
  art.add(graphics);
  if (componentLabel) art.add(componentLabel);
  art.setDepth(entity.mechanic === "goal" ? 7 : 4);
  bodyObject.setVisible(false);

  let artLabel: Phaser.GameObjects.Text | undefined;
  if (entity.sourceLabel) {
    artLabel = scene.add.text(
      bodyObject.x,
      bodyObject.y - bodyObject.height / 2 - 13,
      entity.sourceLabel.slice(0, 18),
      {
        fontFamily: "monospace",
        fontSize: "12px",
        color: palette.label,
        backgroundColor: "rgba(20,17,15,0.78)",
        padding: { x: 5, y: 3 },
      },
    );
    artLabel.setOrigin(0.5, 0.5);
    artLabel.setDepth(8);
  }

  const decorated = bodyObject as T & EntityArtCarrier;
  decorated.art = art;
  decorated.artLabel = artLabel;
  decorated.visualKind = visual.kind;
  decorated.componentId = visual.componentId;
  decorated.usesExactObjectArt = Boolean(componentLabel);
  return decorated;
}

export function syncEntityArt(object: RectangleBody & EntityArtCarrier): void {
  object.art.setPosition(object.x, object.y);
  object.artLabel?.setPosition(object.x, object.y - object.height / 2 - 13);
}

export function destroyEntityArt(object: EntityArtCarrier): void {
  object.art.destroy(true);
  object.artLabel?.destroy();
}

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

export function animateEntityArt(
  scene: Phaser.Scene,
  object: RectangleBody & EntityArtCarrier,
  mechanic: GameEntitySpec["mechanic"],
): void {
  if (reducedMotion()) return;

  if (!object.usesExactObjectArt && object.visualKind === "saw-blade") {
    scene.tweens.add({ targets: object.art, angle: 360, duration: 2200, repeat: -1 });
    return;
  }

  if (mechanic === "collectible") {
    scene.tweens.add({
      targets: object.art,
      y: object.y - 8,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    return;
  }

  if (mechanic === "bounce_pad") {
    scene.tweens.add({
      targets: object.art,
      scaleY: 0.88,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    return;
  }

  if (mechanic === "portal" || mechanic === "goal") {
    scene.tweens.add({
      targets: object.art,
      scaleX: 1.045,
      scaleY: 1.045,
      alpha: 0.82,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    return;
  }

  if (mechanic === "hazard") {
    scene.tweens.add({
      targets: object.art,
      alpha: 0.76,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
