import * as Phaser from "phaser";
import {
  BOUNCE_VELOCITY,
  GROUND_HEIGHT,
  GROUND_TOP,
  MAX_FALL_SPEED,
  PROJECTILE_SIZE,
  SKYFALL_OBJECT_SIZE,
  SKYFALL_SAFE_ZONE_X,
} from "@/game/constants";
import type { ControlState, GameBus } from "@/game/bus";
import { paletteForSpec, type ThemePalette } from "@/game/theme";
import type { GameSpec } from "@/game/types";
import { createRng, type Rng } from "@/game/generation/rng";
import {
  createPlayer,
  respawnPlayer,
  updatePlayerArt,
  type PlayerObject,
} from "@/game/entities/Player";
import {
  createBouncePad,
  createMovingPlatform,
  createStaticPlatform,
  type StaticRect,
} from "@/game/entities/Platform";
import { createHazard } from "@/game/entities/Hazard";
import { createCollectible } from "@/game/entities/Collectible";
import { createPortal } from "@/game/entities/Portal";
import { createGoal } from "@/game/entities/Goal";
import { createTarget, type TargetRect } from "@/game/entities/Target";
import {
  createProjectileVisual,
  createSkyfallVisual,
  destroyEntityArt,
} from "@/game/art/entityArt";
import { createGroundArt, createWorldBackdrop } from "@/game/art/worldArt";

const PORTAL_COOLDOWN_MS = 900;
const HUD_INTERVAL_MS = 100;
const GOAL_HINT_COOLDOWN_MS = 1400;

type CollectibleRect = StaticRect & { collected?: boolean };

type Projectile = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.Body;
  visual: Phaser.GameObjects.Container;
  spawnX: number;
};

type Faller = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.Body;
  visual: Phaser.GameObjects.Container;
};

export class GameScene extends Phaser.Scene {
  private spec!: GameSpec;
  private bus!: GameBus;
  private controls!: ControlState;
  private palette!: ThemePalette;
  private player!: PlayerObject;
  private collectibles: CollectibleRect[] = [];
  private portals: StaticRect[] = [];
  private targets: TargetRect[] = [];
  private projectiles: Projectile[] = [];
  private fallers: Faller[] = [];
  private goal: StaticRect | undefined;
  private keys!: {
    left: Phaser.Input.Keyboard.Key[];
    right: Phaser.Input.Keyboard.Key[];
    jump: Phaser.Input.Keyboard.Key[];
    restart: Phaser.Input.Keyboard.Key[];
    shoot: Phaser.Input.Keyboard.Key[];
  };

  private elapsedMs = 0;
  private deaths = 0;
  private collected = 0;
  private killCount = 0;
  private completed = false;
  private started = false;
  private hasEverStarted = false;
  private goalLocked = false;
  private hudAccumulator = 0;
  private portalCooldownUntil = 0;
  private goalHintUntil = 0;
  private shootCooldownUntil = 0;
  private jumpWasDown = false;
  private shootWasDown = false;
  private facing: 1 | -1 = 1;
  private rng!: Rng;
  private skyfallTimer: Phaser.Time.TimerEvent | undefined;

  constructor() {
    super("GameScene");
  }

  create() {
    this.spec = this.registry.get("spec") as GameSpec;
    this.bus = this.registry.get("bus") as GameBus;
    this.controls = this.registry.get("controls") as ControlState;
    this.palette = paletteForSpec(this.spec);
    this.rng = createRng((this.spec.seed ?? 1) ^ 0x9e3779b9);

    this.elapsedMs = 0;
    this.deaths = 0;
    this.collected = 0;
    this.killCount = 0;
    this.completed = false;
    this.started = false;
    this.hudAccumulator = 0;
    this.facing = 1;
    this.collectibles = [];
    this.portals = [];
    this.targets = [];
    this.projectiles = [];
    this.fallers = [];
    this.goal = undefined;
    this.skyfallTimer = undefined;

    const { width, height, gravityY } = this.spec.world;
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = gravityY;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setBackgroundColor(this.palette.background);

    createWorldBackdrop(this, this.spec, this.palette);

    const solids: Phaser.GameObjects.GameObject[] = [this.createGround()];
    const bouncePads: Phaser.GameObjects.GameObject[] = [];
    const hazards: Phaser.GameObjects.GameObject[] = [];

    for (const entity of this.spec.entities) {
      switch (entity.mechanic) {
        case "static_platform":
          solids.push(createStaticPlatform(this, entity, this.palette));
          break;
        case "moving_platform":
          solids.push(createMovingPlatform(this, entity, this.palette));
          break;
        case "bounce_pad":
          bouncePads.push(createBouncePad(this, entity, this.palette));
          break;
        case "hazard":
          hazards.push(createHazard(this, entity, this.palette));
          break;
        case "collectible": {
          const collectible = createCollectible(
            this,
            entity,
            this.palette,
          ) as CollectibleRect;
          this.collectibles.push(collectible);
          break;
        }
        case "portal":
          this.portals.push(
            createPortal(this, entity, this.palette) as StaticRect,
          );
          break;
        case "target":
          this.targets.push(createTarget(this, entity, this.palette));
          break;
        case "goal":
          this.goal = createGoal(this, entity, this.palette);
          break;
      }
    }

    // Modes with an objective start with a locked exit door.
    this.goalLocked =
      (this.spec.mode === "shooter" &&
        (this.spec.shooter?.requiredKills ?? 0) > 0) ||
      (this.spec.mode === "rush" &&
        (this.spec.rush?.requiredCollectibles ?? 0) > 0);
    if (this.goalLocked && this.goal) this.goal.art.setAlpha(0.55);

    this.player = createPlayer(this, this.spec, this.palette);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.physics.add.collider(this.player, solids);
    this.physics.add.collider(this.player, bouncePads, (playerObject) => {
      const body = (playerObject as PlayerObject).body;
      body.setVelocityY(BOUNCE_VELOCITY);
    });
    this.physics.add.overlap(this.player, hazards, () => this.killPlayer());
    this.physics.add.overlap(this.player, this.collectibles, (_p, other) =>
      this.collect(other as CollectibleRect),
    );
    if (this.targets.length > 0) {
      this.physics.add.overlap(this.player, this.targets, (_p, other) => {
        if (!(other as TargetRect).destroyed) this.killPlayer();
      });
    }
    if (this.portals.length === 2) {
      this.physics.add.overlap(this.player, this.portals, (_p, other) =>
        this.teleport(other as StaticRect),
      );
    }
    if (this.goal) {
      this.physics.add.overlap(this.player, this.goal, () => this.tryFinish());
    }

    if (this.spec.skyfall) this.startSkyfall();

    this.registerKeys();
    // The rules popup gates the run: physics stays frozen until the player
    // presses start, so reading the rules never costs run time.
    this.physics.pause();
    this.emitHud();
    this.bus.emit("ready", undefined);
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    // Rules-popup gate: the run only advances while the popup is dismissed.
    // Reopening the popup re-pauses physics without ending the session.
    if (!this.started) {
      if (!this.controls.started) return;
      this.started = true;
      this.physics.resume();
      if (!this.hasEverStarted) {
        this.hasEverStarted = true;
        this.bus.emit("gameEvent", { type: "game_started" });
      }
    } else if (!this.controls.started && !this.completed) {
      this.started = false;
      this.physics.pause();
      return;
    }

    if (!this.completed) {
      this.elapsedMs += delta;
      this.hudAccumulator += delta;
      if (this.hudAccumulator >= HUD_INTERVAL_MS) {
        this.hudAccumulator = 0;
        this.emitHud();
      }
      if (this.timeLeftMs() === 0) {
        this.flashMessage("OUT OF TIME");
        this.restartRun();
        return;
      }
    }

    const left = this.controls.left || this.isDown(this.keys.left);
    const right = this.controls.right || this.isDown(this.keys.right);
    const jump = this.controls.jump || this.isDown(this.keys.jump);
    const restart = this.controls.restart || this.isDown(this.keys.restart);
    const shoot = this.controls.shoot || this.isDown(this.keys.shoot);

    const body = this.player.body;
    const speed = this.spec.player.moveSpeed;
    body.setVelocityX(left && !right ? -speed : right && !left ? speed : 0);
    if (left && !right) this.facing = -1;
    if (right && !left) this.facing = 1;
    if (body.velocity.y > MAX_FALL_SPEED) body.setVelocityY(MAX_FALL_SPEED);

    const onGround = body.blocked.down || body.touching.down;
    updatePlayerArt(this.player, onGround, time);
    if (jump && !this.jumpWasDown && onGround && !this.completed) {
      body.setVelocityY(this.spec.player.jumpVelocity);
    }
    this.jumpWasDown = jump;

    if (
      this.spec.player.canShoot &&
      shoot &&
      !this.shootWasDown &&
      !this.completed
    ) {
      this.tryShoot(time);
    }
    this.shootWasDown = shoot;

    this.updateProjectiles();
    this.updateFallers();

    if (this.player.y > this.spec.world.height - 4 && !this.completed) {
      this.killPlayer();
    }

    if (restart) {
      this.controls.restart = false;
      this.restartRun();
    }
  }

  private isDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
    return keys.some((key) => key.isDown);
  }

  private registerKeys() {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      this.keys = { left: [], right: [], jump: [], restart: [], shoot: [] };
      return;
    }
    const add = (codes: string[]) => codes.map((code) => keyboard.addKey(code));
    this.keys = {
      left: add(["A", "LEFT"]),
      right: add(["D", "RIGHT"]),
      jump: add(["W", "UP", "SPACE"]),
      restart: add(["R"]),
      shoot: add(["X", "F"]),
    };
    keyboard.addCapture([
      "A",
      "D",
      "W",
      "S",
      "LEFT",
      "RIGHT",
      "UP",
      "DOWN",
      "SPACE",
      "R",
      "X",
      "F",
    ]);
  }

  private createGround(): Phaser.GameObjects.Rectangle & {
    body: Phaser.Physics.Arcade.StaticBody;
  } {
    const { width } = this.spec.world;
    const ground = this.add.rectangle(
      width / 2,
      GROUND_TOP + GROUND_HEIGHT / 2,
      width,
      GROUND_HEIGHT,
      this.palette.ground,
    );
    this.physics.add.existing(ground, true);
    ground.setVisible(false);
    createGroundArt(
      this,
      width,
      GROUND_TOP,
      GROUND_HEIGHT,
      this.spec.theme,
      this.palette,
    );
    return ground as Phaser.GameObjects.Rectangle & {
      body: Phaser.Physics.Arcade.StaticBody;
    };
  }

  // ---------------------------------------------------------------- shooter

  private tryShoot(time: number) {
    const projectileSpec = this.spec.projectile;
    if (!projectileSpec || time < this.shootCooldownUntil) return;
    this.shootCooldownUntil = time + projectileSpec.cooldownMs;

    const rect = this.add.rectangle(
      this.player.x + this.facing * 26,
      this.player.y - 4,
      PROJECTILE_SIZE,
      PROJECTILE_SIZE,
      this.palette.collectible,
    );
    this.physics.add.existing(rect);
    rect.setVisible(false);

    const projectile = rect as Projectile;
    projectile.body.setAllowGravity(false);
    projectile.body.setVelocityX(this.facing * projectileSpec.speed);
    projectile.spawnX = projectile.x;
    projectile.visual = createProjectileVisual(
      this,
      projectileSpec.componentId,
      PROJECTILE_SIZE + 6,
    );
    projectile.visual.setPosition(projectile.x, projectile.y);
    projectile.visual.setDepth(9);
    this.tweens.add({
      targets: projectile.visual,
      angle: this.facing * 360,
      duration: 700,
      repeat: -1,
    });

    // Projectiles deliberately ignore platforms: any drone hovering over a
    // reachable surface can always be hit from that surface.
    this.physics.add.overlap(projectile, this.targets, (_projectile, other) => {
      this.destroyTarget(other as TargetRect);
      this.removeProjectile(projectile);
    });

    this.projectiles.push(projectile);
  }

  private updateProjectiles() {
    const projectileSpec = this.spec.projectile;
    if (!projectileSpec) return;
    for (const projectile of [...this.projectiles]) {
      projectile.visual.setPosition(projectile.x, projectile.y);
      const traveled = Math.abs(projectile.x - projectile.spawnX);
      const outOfWorld =
        projectile.x < -30 || projectile.x > this.spec.world.width + 30;
      if (traveled > projectileSpec.maxRangePx || outOfWorld) {
        this.removeProjectile(projectile);
      }
    }
  }

  private removeProjectile(projectile: Projectile) {
    const index = this.projectiles.indexOf(projectile);
    if (index >= 0) this.projectiles.splice(index, 1);
    projectile.visual.destroy(true);
    projectile.destroy();
  }

  private destroyTarget(target: TargetRect) {
    if (target.destroyed || this.completed) return;
    target.destroyed = true;

    const burst = this.add.circle(target.x, target.y, 8, this.palette.hazard, 0.9);
    burst.setDepth(9);
    this.tweens.add({
      targets: burst,
      radius: 34,
      alpha: 0,
      duration: 260,
      onComplete: () => burst.destroy(),
    });

    destroyEntityArt(target);
    target.destroy();
    this.killCount += 1;
    this.emitHud();
    const required = this.spec.shooter?.requiredKills ?? 0;
    this.bus.emit("gameEvent", {
      type: "target_destroyed",
      payload: { remaining: Math.max(0, required - this.killCount) },
    });

    if (this.spec.mode === "shooter" && this.killCount >= required) {
      this.unlockGoal();
    }
  }

  // ---------------------------------------------------------------- skyfall

  private startSkyfall() {
    const skyfall = this.spec.skyfall;
    if (!skyfall) return;
    this.skyfallTimer = this.time.addEvent({
      delay: skyfall.intervalMs,
      loop: true,
      callback: () => this.spawnFaller(),
    });
  }

  private spawnFaller() {
    const skyfall = this.spec.skyfall;
    if (!skyfall || !this.started || this.completed) return;
    if (this.fallers.length >= skyfall.maxConcurrent) return;

    const x = this.rng.int(
      SKYFALL_SAFE_ZONE_X + 60,
      this.spec.world.width - 60,
    );

    const rect = this.add.rectangle(
      x,
      -SKYFALL_OBJECT_SIZE,
      SKYFALL_OBJECT_SIZE - 8,
      SKYFALL_OBJECT_SIZE - 8,
      this.palette.hazard,
    );
    this.physics.add.existing(rect);
    rect.setVisible(false);

    const faller = rect as Faller;
    faller.body.setAllowGravity(false);
    faller.body.setVelocityY(skyfall.fallSpeed);
    const componentId =
      skyfall.componentIds.length > 0
        ? skyfall.componentIds[this.rng.int(0, skyfall.componentIds.length - 1)]
        : undefined;
    faller.visual = createSkyfallVisual(
      this,
      componentId,
      SKYFALL_OBJECT_SIZE,
      this.palette,
    );
    faller.visual.setPosition(faller.x, faller.y);
    faller.visual.setDepth(6);
    this.tweens.add({
      targets: faller.visual,
      angle: this.rng.next() > 0.5 ? 24 : -24,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.physics.add.overlap(this.player, faller, () => {
      this.removeFaller(faller);
      this.killPlayer();
    });

    this.fallers.push(faller);
  }

  private updateFallers() {
    for (const faller of [...this.fallers]) {
      faller.visual.setPosition(faller.x, faller.y);
      if (faller.y >= GROUND_TOP - 8) {
        const poof = this.add.circle(
          faller.x,
          GROUND_TOP - 10,
          6,
          this.palette.backgroundAccent,
          0.85,
        );
        poof.setDepth(6);
        this.tweens.add({
          targets: poof,
          radius: 22,
          alpha: 0,
          duration: 240,
          onComplete: () => poof.destroy(),
        });
        this.removeFaller(faller);
      }
    }
  }

  private removeFaller(faller: Faller) {
    const index = this.fallers.indexOf(faller);
    if (index >= 0) this.fallers.splice(index, 1);
    faller.visual.destroy(true);
    faller.destroy();
  }

  // ------------------------------------------------------------------- rush

  /** Milliseconds left in rush mode; undefined elsewhere, 0 means expired. */
  private timeLeftMs(): number | undefined {
    const rush = this.spec.rush;
    if (!rush || this.spec.mode !== "rush" || this.completed) return undefined;
    return Math.max(0, Math.round(rush.timeLimitSeconds * 1000 - this.elapsedMs));
  }

  // ------------------------------------------------------------- objectives

  private collect(collectible: CollectibleRect) {
    if (collectible.collected) return;
    collectible.collected = true;
    destroyEntityArt(collectible);
    collectible.destroy();
    this.collected += 1;
    this.emitHud();
    this.bus.emit("gameEvent", {
      type: "collectible_collected",
      payload: { total: this.collected },
    });

    if (
      this.spec.mode === "rush" &&
      this.collected >= (this.spec.rush?.requiredCollectibles ?? Infinity)
    ) {
      this.unlockGoal();
    }
  }

  private unlockGoal() {
    if (!this.goalLocked) return;
    this.goalLocked = false;
    this.emitHud();
    if (this.goal) {
      this.goal.art.setAlpha(1);
      this.tweens.add({
        targets: this.goal.art,
        scaleX: 1.25,
        scaleY: 1.25,
        duration: 220,
        yoyo: true,
        repeat: 2,
      });
      this.flashMessage("EXIT UNLOCKED");
    }
  }

  private tryFinish() {
    if (this.completed) return;
    if (!this.goalLocked) {
      this.finish();
      return;
    }
    if (this.time.now < this.goalHintUntil) return;
    this.goalHintUntil = this.time.now + GOAL_HINT_COOLDOWN_MS;
    const hint =
      this.spec.mode === "shooter"
        ? `DESTROY ${Math.max(0, (this.spec.shooter?.requiredKills ?? 0) - this.killCount)} MORE DRONE(S)`
        : `COLLECT ${Math.max(0, (this.spec.rush?.requiredCollectibles ?? 0) - this.collected)} MORE`;
    this.flashMessage(hint);
  }

  private flashMessage(message: string) {
    const text = this.add.text(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + this.cameras.main.height * 0.3,
      message,
      {
        fontFamily: "monospace",
        fontSize: "24px",
        color: this.palette.label,
        backgroundColor: "rgba(20,17,15,0.82)",
        padding: { x: 12, y: 8 },
      },
    );
    text.setOrigin(0.5, 0.5);
    text.setDepth(20);
    this.tweens.add({
      targets: text,
      y: text.y - 34,
      alpha: 0,
      duration: 1100,
      ease: "Sine.easeIn",
      onComplete: () => text.destroy(),
    });
  }

  private teleport(portal: StaticRect) {
    if (this.time.now < this.portalCooldownUntil) return;
    const other = this.portals.find((candidate) => candidate !== portal);
    if (!other) return;
    this.portalCooldownUntil = this.time.now + PORTAL_COOLDOWN_MS;
    this.player.body.reset(other.x, other.y - other.height / 2 - 4);
    this.bus.emit("gameEvent", { type: "checkpoint_reached" });
  }

  private killPlayer() {
    if (this.completed) return;
    this.deaths += 1;
    const deathX = Math.round(this.player.x);
    const deathY = Math.round(this.player.y);
    respawnPlayer(this.player, this.spec);
    this.cameras.main.shake(120, 0.006);
    this.emitHud();
    this.bus.emit("gameEvent", {
      type: "player_died",
      payload: {
        x: deathX,
        y: deathY,
        elapsedMs: Math.round(this.elapsedMs),
      },
    });
  }

  private finish() {
    if (this.completed) return;
    this.completed = true;
    this.player.body.setVelocity(0, 0);
    this.skyfallTimer?.remove();
    const result = {
      elapsedMs: Math.round(this.elapsedMs),
      deaths: this.deaths,
      collectibles: this.collected,
      totalCollectibles: this.collectibles.length,
      targetsDestroyed: this.killCount,
    };
    this.bus.emit("completed", result);
    this.bus.emit("gameEvent", {
      type: "game_completed",
      payload: {
        elapsedMs: result.elapsedMs,
        deaths: result.deaths,
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
      },
    });
    this.scene.launch("ResultScene", result);
    this.scene.pause();
  }

  private restartRun() {
    this.bus.emit("gameEvent", { type: "game_restarted" });
    this.scene.stop("ResultScene");
    this.scene.restart();
  }

  private emitHud() {
    this.bus.emit("hud", {
      elapsedMs: Math.round(this.elapsedMs),
      deaths: this.deaths,
      collectibles: this.collected,
      totalCollectibles: this.collectibles.length,
      targetsLeft:
        this.spec.mode === "shooter"
          ? Math.max(0, this.targets.length - this.killCount)
          : undefined,
      totalTargets:
        this.spec.mode === "shooter" ? this.targets.length : undefined,
      timeLeftMs: this.timeLeftMs(),
      goalLocked: this.goalLocked,
    });
  }
}
