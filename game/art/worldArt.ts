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

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

function layer(
  scene: Phaser.Scene,
  depth: number,
  scrollFactor: number,
): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics();
  graphics.setDepth(depth);
  graphics.setScrollFactor(scrollFactor);
  return graphics;
}

/** Vertical two-tone wash covering the whole sky. */
function skyGradient(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  top: number,
  bottom: number,
): void {
  graphics.fillGradientStyle(top, top, bottom, bottom, 1);
  graphics.fillRect(-width * 0.2, 0, width * 1.4, height);
}

/**
 * "Gauntlet" template backdrop: an industrial test chamber. Distant gradient
 * and glow, a mid layer of riveted wall panels and lit windows, and a near
 * layer of hanging cables with pulsing warning beacons by the firing range.
 */
function createGauntletBackdrop(
  scene: Phaser.Scene,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const far = layer(scene, -30, 0.05);
  skyGradient(far, width, height, mix(palette.background, 0x1b2f4a, 0.35), palette.background);
  // Threat glow radiating from the machine's end of the chamber.
  far.fillStyle(palette.hazard, 0.05);
  far.fillEllipse(width * 0.96, height * 0.62, width * 0.7, height * 1.1);
  far.fillStyle(palette.goal, 0.045);
  far.fillEllipse(width * 0.06, height * 0.55, width * 0.5, height * 0.9);

  const mid = layer(scene, -29, 0.18);
  // Riveted wall panels.
  mid.lineStyle(2, mix(palette.backgroundAccent, PAPER, 0.14), 0.5);
  for (let x = 0; x <= width; x += 190) {
    mid.strokeRect(x, height * 0.08, 172, height * 0.62);
    mid.fillStyle(mix(palette.backgroundAccent, PAPER, 0.2), 0.5);
    for (const [rx, ry] of [
      [x + 10, height * 0.1],
      [x + 162, height * 0.1],
      [x + 10, height * 0.66],
      [x + 162, height * 0.66],
    ]) {
      mid.fillCircle(rx, ry, 2.4);
    }
  }
  // Lit observation windows.
  for (let index = 0; index < 8; index += 1) {
    const x = 95 + index * 190;
    const lit = index % 3 !== 1;
    mid.fillStyle(lit ? mix(palette.collectible, palette.background, 0.55) : mix(palette.backgroundAccent, INK, 0.25), lit ? 0.5 : 0.7);
    mid.fillRoundedRect(x - 34, height * 0.2 + (index % 2) * 26, 68, 44, 6);
    mid.lineStyle(2, INK, 0.55);
    mid.strokeRoundedRect(x - 34, height * 0.2 + (index % 2) * 26, 68, 44, 6);
  }
  // Hazard chevrons banding the firing range end.
  const bandY = height * 0.74;
  for (let index = 0; index < 10; index += 1) {
    const x = width * 0.72 + index * 46;
    mid.fillStyle(index % 2 === 0 ? palette.hazard : mix(palette.collectible, palette.hazard, 0.25), 0.22);
    mid.fillTriangle(x, bandY + 26, x + 23, bandY, x + 46, bandY + 26);
  }

  const near = layer(scene, -28, 0.34);
  // Sagging power cables with junction lamps.
  near.lineStyle(3, mix(palette.backgroundAccent, PAPER, 0.24), 0.5);
  for (let index = 0; index < 4; index += 1) {
    const startX = -80 + index * 460;
    near.beginPath();
    near.moveTo(startX, 26 + (index % 2) * 20);
    for (let step = 0; step <= 20; step += 1) {
      const t = step / 20;
      const x = startX + t * 500;
      const sag = Math.sin(t * Math.PI) * (56 + (index % 3) * 14);
      near.lineTo(x, 26 + (index % 2) * 20 + sag);
    }
    near.strokePath();
  }

  // Pulsing warning beacons (animated accents).
  if (!reducedMotion()) {
    for (const beaconX of [width * 0.78, width * 0.9]) {
      const glow = scene.add.circle(beaconX, height * 0.1, 7, palette.hazard, 0.75);
      glow.setDepth(-28);
      glow.setScrollFactor(0.34);
      scene.tweens.add({
        targets: glow,
        alpha: 0.15,
        scale: 1.7,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }
}

/**
 * "Storm" template backdrop: a dusk sky mid-tempest. Far moonlit gradient,
 * drifting cloud banks, a low skyline, slanted rain and a repeating distant
 * lightning flash.
 */
function createStormBackdrop(
  scene: Phaser.Scene,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const far = layer(scene, -30, 0.05);
  skyGradient(far, width, height, mix(palette.background, 0x2b2f6e, 0.5), palette.background);
  // Moon with halo, partly veiled.
  far.fillStyle(mix(PAPER, palette.goal, 0.3), 0.12);
  far.fillCircle(width * 0.76, height * 0.16, 92);
  far.fillStyle(mix(PAPER, palette.goal, 0.2), 0.85);
  far.fillCircle(width * 0.76, height * 0.16, 46);
  far.fillStyle(mix(palette.background, 0x2b2f6e, 0.4), 0.5);
  far.fillCircle(width * 0.79, height * 0.14, 40);
  // Distant skyline silhouette.
  far.fillStyle(mix(palette.background, INK, 0.35), 0.9);
  for (let index = 0; index < 14; index += 1) {
    const buildingWidth = 84 + (index % 4) * 26;
    const buildingHeight = 60 + (index * 37) % 130;
    far.fillRect(index * 122 - 30, height * 0.78 - buildingHeight, buildingWidth, buildingHeight + 40);
  }

  const mid = layer(scene, -29, 0.16);
  // Slanted rain, two densities.
  mid.lineStyle(2, mix(palette.platform, PAPER, 0.2), 0.14);
  for (let index = 0; index < 60; index += 1) {
    const x = (index * 89 + 17) % (width * 1.2) - width * 0.1;
    const y = (index * 53 + 31) % (height * 0.9);
    mid.lineBetween(x, y, x - 14, y + 34);
  }
  mid.lineStyle(1.5, mix(palette.platform, PAPER, 0.35), 0.1);
  for (let index = 0; index < 40; index += 1) {
    const x = (index * 127 + 61) % (width * 1.2) - width * 0.1;
    const y = (index * 71 + 7) % (height * 0.9);
    mid.lineBetween(x, y, x - 10, y + 24);
  }

  // Drifting cloud banks (animated accents).
  const cloudLayerDepth = -28;
  for (let index = 0; index < 5; index += 1) {
    const cloud = scene.add.graphics();
    cloud.setDepth(cloudLayerDepth);
    cloud.setScrollFactor(0.12);
    const baseX = index * 340 - 60;
    const baseY = 50 + (index % 3) * 52;
    const tone = mix(palette.backgroundAccent, 0x3a4172, 0.5);
    cloud.fillStyle(tone, 0.85);
    cloud.fillEllipse(baseX, baseY, 260, 62);
    cloud.fillEllipse(baseX + 110, baseY + 16, 210, 52);
    cloud.fillEllipse(baseX - 90, baseY + 20, 170, 44);
    if (!reducedMotion()) {
      scene.tweens.add({
        targets: cloud,
        x: 40 + (index % 2) * 26,
        duration: 7000 + index * 1400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  // Distant lightning: a bolt and a whole-sky flash on a slow loop.
  if (!reducedMotion()) {
    const bolt = scene.add.graphics();
    bolt.setDepth(-29);
    bolt.setScrollFactor(0.1);
    bolt.lineStyle(3, mix(PAPER, palette.goal, 0.25), 0.9);
    bolt.beginPath();
    bolt.moveTo(width * 0.24, height * 0.06);
    bolt.lineTo(width * 0.21, height * 0.2);
    bolt.lineTo(width * 0.26, height * 0.24);
    bolt.lineTo(width * 0.22, height * 0.4);
    bolt.strokePath();
    bolt.setAlpha(0);

    const flash = scene.add.rectangle(width / 2, height / 2, width * 1.4, height, 0xdfe6ff, 0.1);
    flash.setDepth(-28);
    flash.setScrollFactor(0.05);
    flash.setAlpha(0);

    scene.tweens.add({
      targets: [bolt, flash],
      alpha: { from: 0, to: 1 },
      duration: 120,
      yoyo: true,
      hold: 80,
      repeat: -1,
      repeatDelay: 5200,
    });
  }
}

/**
 * "Quest" template backdrop: a torchlit dungeon hall. Far gradient with a
 * glowing doorway foreshadowing the goal, brick arches and banners in the
 * middle, flickering torch glows and rising dust motes up close.
 */
function createQuestBackdrop(
  scene: Phaser.Scene,
  width: number,
  height: number,
  palette: ThemePalette,
): void {
  const far = layer(scene, -30, 0.05);
  skyGradient(far, width, height, mix(palette.background, 0x3a2352, 0.5), palette.background);
  // The legend: a faint glowing doorway on the horizon, far right.
  far.fillStyle(palette.goal, 0.05);
  far.fillEllipse(width * 0.9, height * 0.42, 300, 420);
  far.fillStyle(mix(palette.goal, PAPER, 0.3), 0.14);
  far.fillRoundedRect(width * 0.9 - 40, height * 0.3, 80, 150, 34);
  // Sparkles in the gloom.
  for (let index = 0; index < 26; index += 1) {
    const x = (index * 151 + 43) % width;
    const y = (index * 97 + 19) % Math.round(height * 0.5);
    far.fillStyle(index % 3 === 0 ? palette.collectible : PAPER, 0.25 + (index % 4) * 0.1);
    far.fillCircle(x, y, index % 4 === 0 ? 2.2 : 1.3);
  }

  const mid = layer(scene, -29, 0.18);
  // Brick arches along the hall.
  for (let index = 0; index < 6; index += 1) {
    const x = 130 + index * 290;
    mid.lineStyle(10, mix(palette.backgroundAccent, palette.platform, 0.3), 0.5);
    mid.beginPath();
    mid.arc(x, height * 0.56, 108, Math.PI, 0, false);
    mid.strokePath();
    mid.lineBetween(x - 108, height * 0.56, x - 108, height * 0.8);
    mid.lineBetween(x + 108, height * 0.56, x + 108, height * 0.8);
    // Keystone.
    mid.fillStyle(mix(palette.platform, INK, 0.3), 0.55);
    mid.fillRect(x - 12, height * 0.56 - 118, 24, 26);
  }
  // Mortar hints.
  mid.lineStyle(1.5, mix(palette.backgroundAccent, PAPER, 0.1), 0.25);
  for (let y = height * 0.12; y < height * 0.5; y += 44) {
    mid.lineBetween(0, y, width, y);
  }

  const near = layer(scene, -28, 0.32);
  // Hanging banners between the arches.
  for (let index = 0; index < 5; index += 1) {
    const x = 280 + index * 290;
    const tone = index % 2 === 0 ? palette.hazard : palette.portal;
    near.fillStyle(mix(tone, INK, 0.35), 0.6);
    near.fillTriangle(x - 34, 0, x + 34, 0, x, 96);
    near.lineStyle(2, INK, 0.5);
    near.strokeTriangle(x - 34, 0, x + 34, 0, x, 96);
    near.fillStyle(palette.collectible, 0.5);
    near.fillCircle(x, 34, 6);
  }
  // Torch posts.
  for (const torchX of [width * 0.2, width * 0.52, width * 0.84]) {
    near.fillStyle(mix(palette.platform, INK, 0.45), 0.8);
    near.fillRoundedRect(torchX - 5, height * 0.5, 10, 120, 4);
    near.fillStyle(0xffa94d, 0.9);
    near.fillEllipse(torchX, height * 0.48, 16, 24);
    if (!reducedMotion()) {
      const glow = scene.add.circle(torchX, height * 0.48, 30, 0xffb45e, 0.16);
      glow.setDepth(-28);
      glow.setScrollFactor(0.32);
      scene.tweens.add({
        targets: glow,
        alpha: 0.05,
        scale: 1.35,
        duration: 620 + Math.round(torchX % 180),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  // Rising dust motes (animated accents).
  if (!reducedMotion()) {
    for (let index = 0; index < 8; index += 1) {
      const mote = scene.add.circle(
        (index * 211 + 90) % width,
        height * 0.55 + (index % 4) * 60,
        2.2,
        mix(palette.collectible, PAPER, 0.4),
        0.4,
      );
      mote.setDepth(-28);
      mote.setScrollFactor(0.3);
      scene.tweens.add({
        targets: mote,
        y: mote.y - 140,
        alpha: 0,
        duration: 5200 + index * 700,
        repeat: -1,
        delay: index * 640,
        ease: "Sine.easeOut",
      });
    }
  }
}

/** Creates deterministic, lightweight parallax scenery for the selected theme. */
export function createWorldBackdrop(
  scene: Phaser.Scene,
  spec: GameSpec,
  palette: ThemePalette,
): void {
  const { width, height } = spec.world;

  // The three template themes get bespoke multi-layer scenes.
  if (spec.theme === "gauntlet") {
    createGauntletBackdrop(scene, width, height, palette);
    return;
  }
  if (spec.theme === "storm") {
    createStormBackdrop(scene, width, height, palette);
    return;
  }
  if (spec.theme === "quest") {
    createQuestBackdrop(scene, width, height, palette);
    return;
  }

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

  if (theme === "gauntlet") {
    // Riveted deck plating with hazard striping at the firing-range end.
    graphics.fillStyle(mix(palette.ground, palette.platform, 0.3), 1);
    graphics.fillRect(0, top, width, 12);
    graphics.lineStyle(2, mix(palette.ground, PAPER, 0.22), 0.4);
    for (let x = 0; x < width; x += 110) {
      graphics.strokeRect(x + 5, top + 18, 100, height - 26);
      graphics.fillStyle(mix(palette.ground, PAPER, 0.3), 0.5);
      graphics.fillCircle(x + 14, top + 26, 2.6);
      graphics.fillCircle(x + 96, top + 26, 2.6);
    }
    for (let index = 0; index < 6; index += 1) {
      const x = width - 260 + index * 44;
      graphics.fillStyle(index % 2 === 0 ? 0xe4a33d : mix(palette.ground, INK, 0.4), 0.55);
      graphics.fillTriangle(x, top, x + 22, top, x + 11, top + 12);
    }
  } else if (theme === "storm") {
    // Rain-slick pavement with puddle glints.
    graphics.fillStyle(mix(palette.ground, 0x8ce8ff, 0.16), 1);
    graphics.fillRect(0, top, width, 11);
    graphics.lineStyle(2, mix(palette.ground, PAPER, 0.18), 0.4);
    for (let x = 0; x < width; x += 64) {
      graphics.lineBetween(x, top + 16, x + 30, top + 16);
    }
    graphics.fillStyle(mix(palette.goal, PAPER, 0.3), 0.14);
    for (let x = 46; x < width; x += 210) {
      graphics.fillEllipse(x, top + 34 + (x % 3) * 6, 74, 10);
    }
  } else if (theme === "quest") {
    // Worn flagstones.
    graphics.fillStyle(mix(palette.ground, PAPER, 0.2), 1);
    graphics.fillRect(0, top, width, 13);
    graphics.lineStyle(2, mix(palette.ground, INK, 0.45), 0.6);
    for (let row = 0; row < 2; row += 1) {
      const y = top + 20 + row * 26;
      for (let x = row % 2 === 0 ? 0 : 48; x < width; x += 96) {
        graphics.strokeRect(x, y, 88, 22);
      }
    }
  } else if (theme === "forest") {
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
