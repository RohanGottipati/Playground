import * as Phaser from "phaser";
import type { ThemePalette } from "@/game/theme";
import {
  objectArtDescriptor,
  type ObjectArtDescriptor,
} from "./objectArtDescriptor";

const INK = 0x1b1b23;
const PAPER = 0xf8f4e8;

function channel(color: number, shift: number): number {
  return (color >> shift) & 0xff;
}

function mix(from: number, to: number, amount: number): number {
  const t = Phaser.Math.Clamp(amount, 0, 1);
  const r = Math.round(channel(from, 16) + (channel(to, 16) - channel(from, 16)) * t);
  const g = Math.round(channel(from, 8) + (channel(to, 8) - channel(from, 8)) * t);
  const b = Math.round(channel(from, 0) + (channel(to, 0) - channel(from, 0)) * t);
  return (r << 16) | (g << 8) | b;
}

function rounded(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: number,
  line: number,
): void {
  graphics.fillStyle(fill, 1);
  graphics.fillRoundedRect(x, y, width, height, radius);
  graphics.lineStyle(line, INK, 0.94);
  graphics.strokeRoundedRect(x, y, width, height, radius);
}

function drawRound(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  cy: number,
  line: number,
): void {
  const radius = Math.min(width, height) * 0.42;
  graphics.fillStyle(descriptor.primary, 1);
  graphics.lineStyle(line, INK, 0.94);
  graphics.fillEllipse(0, cy, radius * 2, radius * (descriptor.variant % 2 ? 1.7 : 2));
  graphics.strokeEllipse(0, cy, radius * 2, radius * (descriptor.variant % 2 ? 1.7 : 2));
  graphics.fillStyle(descriptor.secondary, 0.68);
  graphics.fillCircle(-radius * 0.2, cy - radius * 0.2, radius * 0.48);
  graphics.lineStyle(Math.max(1, line * 0.45), PAPER, 0.75);
  graphics.strokeCircle(0, cy, radius * 0.64);
}

function drawVehicle(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  top: number,
  line: number,
): void {
  const bodyY = top + height * 0.44;
  rounded(graphics, -width * 0.46, bodyY, width * 0.92, height * 0.38, height * 0.1, descriptor.primary, line);
  graphics.fillStyle(descriptor.secondary, 1);
  graphics.lineStyle(line, INK, 0.94);
  graphics.fillPoints([
    { x: -width * 0.28, y: bodyY }, { x: -width * 0.13, y: top + height * 0.18 },
    { x: width * 0.22, y: top + height * 0.18 }, { x: width * 0.36, y: bodyY },
  ], true);
  graphics.strokePoints([
    { x: -width * 0.28, y: bodyY }, { x: -width * 0.13, y: top + height * 0.18 },
    { x: width * 0.22, y: top + height * 0.18 }, { x: width * 0.36, y: bodyY },
  ], true);
  for (const x of [-width * 0.28, width * 0.29]) {
    graphics.fillStyle(INK, 1);
    graphics.fillCircle(x, top + height * 0.82, height * 0.13);
    graphics.fillStyle(PAPER, 1);
    graphics.fillCircle(x, top + height * 0.82, height * 0.05);
  }
}

function drawContainer(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  top: number,
  line: number,
): void {
  const bodyWidth = width * 0.66;
  graphics.fillStyle(descriptor.primary, 1);
  graphics.lineStyle(line, INK, 0.94);
  graphics.fillPoints([
    { x: -bodyWidth * 0.48, y: top + height * 0.18 },
    { x: bodyWidth * 0.48, y: top + height * 0.18 },
    { x: bodyWidth * 0.38, y: top + height * 0.9 },
    { x: -bodyWidth * 0.38, y: top + height * 0.9 },
  ], true);
  graphics.strokePoints([
    { x: -bodyWidth * 0.48, y: top + height * 0.18 },
    { x: bodyWidth * 0.48, y: top + height * 0.18 },
    { x: bodyWidth * 0.38, y: top + height * 0.9 },
    { x: -bodyWidth * 0.38, y: top + height * 0.9 },
  ], true);
  graphics.fillStyle(descriptor.secondary, 1);
  graphics.fillEllipse(0, top + height * 0.18, bodyWidth, height * 0.18);
  graphics.lineStyle(line, INK, 0.94);
  graphics.strokeEllipse(0, top + height * 0.18, bodyWidth, height * 0.18);
  if (descriptor.variant % 2 === 0) {
    graphics.strokeEllipse(bodyWidth * 0.48, top + height * 0.5, width * 0.28, height * 0.38);
  }
}

function drawScreen(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  top: number,
  line: number,
): void {
  rounded(graphics, -width * 0.44, top + height * 0.12, width * 0.88, height * 0.7, height * 0.08, INK, line);
  rounded(graphics, -width * 0.37, top + height * 0.2, width * 0.74, height * 0.48, height * 0.04, mix(descriptor.primary, PAPER, 0.25), Math.max(1, line * 0.5));
  graphics.fillStyle(descriptor.secondary, 1);
  graphics.fillRoundedRect(-width * 0.22, top + height * 0.85, width * 0.44, height * 0.08, 3);
}

function drawLong(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  cy: number,
  line: number,
): void {
  graphics.lineStyle(Math.max(8, height * 0.23), descriptor.primary, 1);
  graphics.lineBetween(-width * 0.38, cy + height * 0.24, width * 0.3, cy - height * 0.24);
  graphics.lineStyle(line, INK, 0.94);
  graphics.lineBetween(-width * 0.42, cy + height * 0.29, width * 0.35, cy - height * 0.29);
  graphics.fillStyle(descriptor.secondary, 1);
  graphics.fillCircle(-width * 0.34, cy + height * 0.2, Math.max(5, height * 0.16));
  graphics.lineStyle(line, INK, 0.94);
  graphics.strokeCircle(-width * 0.34, cy + height * 0.2, Math.max(5, height * 0.16));
}

function drawFurniture(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  top: number,
  line: number,
): void {
  rounded(graphics, -width * 0.42, top + height * 0.3, width * 0.84, height * 0.48, height * 0.1, descriptor.primary, line);
  rounded(graphics, -width * 0.48, top + height * 0.5, width * 0.22, height * 0.34, height * 0.08, descriptor.secondary, line);
  rounded(graphics, width * 0.26, top + height * 0.5, width * 0.22, height * 0.34, height * 0.08, descriptor.secondary, line);
  graphics.lineStyle(line, INK, 0.94);
  graphics.lineBetween(-width * 0.34, top + height * 0.82, -width * 0.36, top + height);
  graphics.lineBetween(width * 0.34, top + height * 0.82, width * 0.36, top + height);
}

function drawFood(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  cy: number,
  line: number,
): void {
  const radius = Math.min(width, height) * 0.4;
  graphics.fillStyle(descriptor.primary, 1);
  graphics.lineStyle(line, INK, 0.94);
  if (descriptor.variant === 0) {
    graphics.fillTriangle(-radius, cy + radius * 0.65, radius, cy + radius * 0.65, 0, cy - radius);
    graphics.strokeTriangle(-radius, cy + radius * 0.65, radius, cy + radius * 0.65, 0, cy - radius);
  } else {
    graphics.fillEllipse(0, cy, radius * 2.1, radius * 1.65);
    graphics.strokeEllipse(0, cy, radius * 2.1, radius * 1.65);
  }
  graphics.fillStyle(descriptor.secondary, 1);
  graphics.fillCircle(-radius * 0.25, cy - radius * 0.1, Math.max(3, radius * 0.15));
  graphics.fillCircle(radius * 0.3, cy + radius * 0.22, Math.max(3, radius * 0.13));
}

function drawWearable(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  top: number,
  line: number,
): void {
  const points = [
    { x: -width * 0.18, y: top + height * 0.15 },
    { x: -width * 0.45, y: top + height * 0.36 },
    { x: -width * 0.31, y: top + height * 0.55 },
    { x: -width * 0.2, y: top + height * 0.45 },
    { x: -width * 0.24, y: top + height * 0.92 },
    { x: width * 0.24, y: top + height * 0.92 },
    { x: width * 0.2, y: top + height * 0.45 },
    { x: width * 0.31, y: top + height * 0.55 },
    { x: width * 0.45, y: top + height * 0.36 },
    { x: width * 0.18, y: top + height * 0.15 },
  ];
  graphics.fillStyle(descriptor.primary, 1);
  graphics.lineStyle(line, INK, 0.94);
  graphics.fillPoints(points, true);
  graphics.strokePoints(points, true);
  graphics.lineStyle(Math.max(1, line * 0.5), descriptor.secondary, 0.9);
  graphics.strokeCircle(0, top + height * 0.18, height * 0.1);
}

function drawNature(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  top: number,
  line: number,
): void {
  graphics.lineStyle(Math.max(5, width * 0.08), descriptor.secondary, 1);
  graphics.lineBetween(0, top + height * 0.88, 0, top + height * 0.28);
  graphics.fillStyle(descriptor.primary, 1);
  graphics.lineStyle(line, INK, 0.9);
  for (const [x, y] of [[-0.18, 0.38], [0.18, 0.3], [-0.14, 0.58], [0.16, 0.55]]) {
    graphics.fillEllipse(width * x, top + height * y, width * 0.34, height * 0.27);
    graphics.strokeEllipse(width * x, top + height * y, width * 0.34, height * 0.27);
  }
}

function drawInstrument(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  top: number,
  line: number,
): void {
  graphics.fillStyle(descriptor.primary, 1);
  graphics.lineStyle(line, INK, 0.94);
  graphics.fillEllipse(-width * 0.12, top + height * 0.63, width * 0.55, height * 0.48);
  graphics.strokeEllipse(-width * 0.12, top + height * 0.63, width * 0.55, height * 0.48);
  graphics.lineStyle(Math.max(7, height * 0.12), descriptor.secondary, 1);
  graphics.lineBetween(width * 0.02, top + height * 0.46, width * 0.38, top + height * 0.12);
  graphics.lineStyle(line, INK, 0.94);
  graphics.lineBetween(width * 0.01, top + height * 0.42, width * 0.4, top + height * 0.08);
}

function drawToolOrToy(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  cy: number,
  line: number,
): void {
  if (descriptor.shape === "toy") {
    const pointCount = 5 + (descriptor.variant % 2);
    const outer = Math.min(width, height) * 0.44;
    const inner = outer * 0.48;
    const points: { x: number; y: number }[] = [];
    for (let index = 0; index < pointCount * 2; index += 1) {
      const angle = -Math.PI / 2 + (index * Math.PI) / pointCount;
      const radius = index % 2 === 0 ? outer : inner;
      points.push({
        x: Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
    graphics.fillStyle(descriptor.primary, 1);
    graphics.lineStyle(line, INK, 0.94);
    graphics.fillPoints(points, true);
    graphics.strokePoints(points, true);
    return;
  }
  graphics.lineStyle(Math.max(8, width * 0.1), descriptor.secondary, 1);
  graphics.lineBetween(-width * 0.22, cy + height * 0.35, width * 0.2, cy - height * 0.25);
  rounded(graphics, width * 0.03, cy - height * 0.42, width * 0.42, height * 0.25, 4, descriptor.primary, line);
}

function drawObject(
  graphics: Phaser.GameObjects.Graphics,
  descriptor: ObjectArtDescriptor,
  width: number,
  height: number,
  top: number,
  line: number,
): void {
  rounded(graphics, -width * 0.42, top + height * 0.15, width * 0.84, height * 0.72, height * 0.12, descriptor.primary, line);
  graphics.fillStyle(descriptor.secondary, 0.8);
  graphics.fillRoundedRect(-width * 0.3, top + height * 0.25, width * 0.6, height * 0.16, 4);
}

/** Draws the exact everyday-object component selected by its stable ID. */
export function drawObjectComponentArt(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  componentId: string | undefined,
  bodyWidth: number,
  bodyHeight: number,
  palette: ThemePalette,
): Phaser.GameObjects.Text | undefined {
  const descriptor = objectArtDescriptor(componentId);
  if (!descriptor) return undefined;

  const width = Phaser.Math.Clamp(bodyWidth * 0.94, 28, 290);
  const height = Phaser.Math.Clamp(
    Math.max(bodyHeight, Math.min(width * 0.5, 110)),
    28,
    170,
  );
  const top = -bodyHeight / 2;
  const cy = top + height / 2;
  const line = Phaser.Math.Clamp(Math.min(width, height) * 0.055, 1.5, 4);
  const adjusted: ObjectArtDescriptor = {
    ...descriptor,
    primary: mix(descriptor.primary, palette.platform, 0.08),
    secondary: mix(descriptor.secondary, palette.collectible, 0.06),
  };

  graphics.fillStyle(INK, 0.16);
  graphics.fillEllipse(0, top + height * 0.96, width * 0.78, Math.max(5, height * 0.08));

  switch (adjusted.shape) {
    case "round": drawRound(graphics, adjusted, width, height, cy, line); break;
    case "vehicle": drawVehicle(graphics, adjusted, width, height, top, line); break;
    case "container": drawContainer(graphics, adjusted, width, height, top, line); break;
    case "screen": drawScreen(graphics, adjusted, width, height, top, line); break;
    case "long": drawLong(graphics, adjusted, width, height, cy, line); break;
    case "furniture": drawFurniture(graphics, adjusted, width, height, top, line); break;
    case "food": drawFood(graphics, adjusted, width, height, cy, line); break;
    case "wearable": drawWearable(graphics, adjusted, width, height, top, line); break;
    case "nature": drawNature(graphics, adjusted, width, height, top, line); break;
    case "instrument": drawInstrument(graphics, adjusted, width, height, top, line); break;
    case "tool":
    case "toy": drawToolOrToy(graphics, adjusted, width, height, cy, line); break;
    default: drawObject(graphics, adjusted, width, height, top, line); break;
  }

  const showName = width >= 90;
  const label = scene.add.text(
    0,
    top + height * 0.62,
    showName ? descriptor.name.toUpperCase().slice(0, 16) : descriptor.monogram,
    {
      fontFamily: "monospace",
      fontStyle: "bold",
      fontSize: `${Phaser.Math.Clamp(height * 0.14, 9, 14)}px`,
      color: "#f8f4e8",
      backgroundColor: "rgba(27,27,35,0.72)",
      padding: { x: 4, y: 2 },
    },
  );
  label.setOrigin(0.5);
  if (label.width > width * 0.7) label.setScale((width * 0.7) / label.width);
  return label;
}
