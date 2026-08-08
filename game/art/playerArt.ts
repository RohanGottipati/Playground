import * as Phaser from "phaser";
import type { ThemePalette } from "@/game/theme";

const INK = 0x1b1b23;
const SKIN = 0xf4c9a8;
const SHIRT = 0x3b82f6;
const TROUSERS = 0x1f2a44;
const HAIR = 0x7c3f1d;

export type HeroArt = {
  container: Phaser.GameObjects.Container;
  leftArm: Phaser.GameObjects.Rectangle;
  rightArm: Phaser.GameObjects.Rectangle;
  leftLeg: Phaser.GameObjects.Rectangle;
  rightLeg: Phaser.GameObjects.Rectangle;
  shadow: Phaser.GameObjects.Ellipse;
  facing: -1 | 1;
};

function outlinedRectangle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  radius = 3,
): Phaser.GameObjects.Rectangle {
  const rectangle = scene.add.rectangle(x, y, width, height, color);
  rectangle.setStrokeStyle(2, INK, 0.95);
  rectangle.setDisplaySize(width, height);
  rectangle.setOrigin(0.5, 0.5);
  rectangle.setName(String(radius));
  return rectangle;
}

export function createHeroArt(
  scene: Phaser.Scene,
  x: number,
  y: number,
  palette: ThemePalette,
): HeroArt {
  const container = scene.add.container(x, y);
  const shadow = scene.add.ellipse(0, 25, 30, 7, INK, 0.18);
  const cape = scene.add.triangle(-7, 2, 0, 0, 14, 4, 3, 22, palette.player, 0.9);
  cape.setStrokeStyle(2, INK, 0.8);
  const body = outlinedRectangle(scene, 0, 5, 23, 24, SHIRT);
  const leftArm = outlinedRectangle(scene, -14, 3, 8, 18, SKIN, 4);
  const rightArm = outlinedRectangle(scene, 14, 3, 8, 18, SKIN, 4);
  const leftLeg = outlinedRectangle(scene, -6, 20, 8, 16, TROUSERS, 3);
  const rightLeg = outlinedRectangle(scene, 6, 20, 8, 16, TROUSERS, 3);
  const head = scene.add.circle(0, -13, 13, SKIN);
  head.setStrokeStyle(2, INK, 0.95);
  const hair = scene.add.ellipse(0, -20, 25, 12, HAIR);
  hair.setStrokeStyle(2, INK, 0.95);
  const leftEye = scene.add.circle(-4, -12, 1.6, INK);
  const rightEye = scene.add.circle(4, -12, 1.6, INK);
  const smile = scene.add.arc(0, -8, 4, 15, 165, false, INK, 0);
  smile.setStrokeStyle(1.5, INK, 0.95);

  container.add([
    shadow,
    cape,
    leftLeg,
    rightLeg,
    body,
    leftArm,
    rightArm,
    head,
    hair,
    leftEye,
    rightEye,
    smile,
  ]);
  container.setDepth(10);

  return {
    container,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    shadow,
    facing: 1,
  };
}

export function updateHeroArt(
  art: HeroArt,
  x: number,
  y: number,
  velocityX: number,
  velocityY: number,
  grounded: boolean,
  time: number,
): void {
  if (Math.abs(velocityX) > 4) art.facing = velocityX < 0 ? -1 : 1;

  const moving = grounded && Math.abs(velocityX) > 8;
  const airborne = !grounded;
  const stride = moving ? Math.sin(time * 0.016) : 0;
  const bob = moving ? Math.abs(Math.sin(time * 0.016)) * -1.5 : 0;

  art.container.setPosition(x, y + bob);
  art.container.setScale(art.facing, 1);
  art.shadow.setScale(airborne ? 0.65 : 1, airborne ? 0.65 : 1);
  art.shadow.setAlpha(airborne ? 0.08 : 0.18);

  if (airborne) {
    art.leftArm.setAngle(-45);
    art.rightArm.setAngle(45);
    art.leftLeg.setAngle(velocityY < 0 ? 24 : 10);
    art.rightLeg.setAngle(velocityY < 0 ? -12 : -24);
    return;
  }

  art.leftArm.setAngle(stride * 28);
  art.rightArm.setAngle(-stride * 28);
  art.leftLeg.setAngle(-stride * 24);
  art.rightLeg.setAngle(stride * 24);
}

export function placeHeroArt(art: HeroArt, x: number, y: number): void {
  art.container.setPosition(x, y);
  art.container.setScale(1, 1);
  art.facing = 1;
}
