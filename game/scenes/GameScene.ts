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
  winConditionFor,
  type WinCondition,
} from "@/game/generation/winCondition";
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
  syncEntityArt,
} from "@/game/art/entityArt";
import { createGroundArt, createWorldBackdrop } from "@/game/art/worldArt";
import {
  EDGE_MARGIN,
  isShelter,
  MIN_SHELTER_GAP,
  rowsByTop,
  SHELTER_MOVEMENT_PROFILES,
  type ShelterMovementProfile,
} from "@/game/templates/shelters";

const PORTAL_COOLDOWN_MS = 900;
const HUD_INTERVAL_MS = 100;
const GOAL_HINT_COOLDOWN_MS = 1400;
/** Post-shove grace so a drone can't juggle the player forever. */
const KNOCKBACK_MS = 400;
const KNOCKBACK_VELOCITY_X = 300;
const KNOCKBACK_VELOCITY_Y = -260;

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

type ShelterRuntime = {
  rect: StaticRect;
  vanished: boolean;
  busy: boolean;
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
  private enemyShots: Projectile[] = [];
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
  private winCondition: WinCondition = "door";
  /** Survive-mode clock; only advances outside the spawn safe zone. */
  private surviveElapsedMs = 0;
  /** Dodge-storm streak: fallers smashed while the player braved the storm. */
  private avoided = 0;
  private knockbackUntil = 0;
  private solids: Phaser.GameObjects.GameObject[] = [];
  private hudAccumulator = 0;
  private portalCooldownUntil = 0;
  private goalHintUntil = 0;
  private shootCooldownUntil = 0;
  private jumpWasDown = false;
  private shootWasDown = false;
  private facing: 1 | -1 = 1;
  private rng!: Rng;
  private skyfallTimer: Phaser.Time.TimerEvent | undefined;
  private gauntletTimer: Phaser.Time.TimerEvent | undefined;
  private shelterTimer: Phaser.Time.TimerEvent | undefined;
  private shelterRows: ShelterRuntime[][] = [];

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
    this.surviveElapsedMs = 0;
    this.avoided = 0;
    this.knockbackUntil = 0;
    this.winCondition = winConditionFor(this.spec);
    this.facing = 1;
    this.collectibles = [];
    this.portals = [];
    this.targets = [];
    this.projectiles = [];
    this.enemyShots = [];
    this.fallers = [];
    this.goal = undefined;
    this.skyfallTimer = undefined;
    this.gauntletTimer = undefined;
    this.shelterTimer = undefined;
    this.shelterRows = [];

    const { width, height, gravityY } = this.spec.world;
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = gravityY;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setBackgroundColor(this.palette.background);

    createWorldBackdrop(this, this.spec, this.palette);

    const solids: Phaser.GameObjects.GameObject[] = [this.createGround()];
    this.solids = solids;
    const bouncePads: Phaser.GameObjects.GameObject[] = [];
    const hazards: Phaser.GameObjects.GameObject[] = [];
    const shelterById = new Map<string, StaticRect>();

    for (const entity of this.spec.entities) {
      switch (entity.mechanic) {
        case "static_platform": {
          const platform = createStaticPlatform(this, entity, this.palette);
          solids.push(platform);
          if (this.spec.skyfall && isShelter(entity)) {
            shelterById.set(entity.id, platform);
          }
          break;
        }
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

    if (this.spec.skyfall && shelterById.size > 0) {
      const shelterEntities = this.spec.entities.filter(isShelter);
      this.shelterRows = rowsByTop(shelterEntities)
        .map((row) =>
          row
            .map((entity) => shelterById.get(entity.id))
            .filter((rect): rect is StaticRect => Boolean(rect))
            .map((rect) => ({ rect, vanished: false, busy: false })),
        )
        .filter((row) => row.length > 0);
    }

    // Legacy shooter/rush specs carry a door that starts locked; new specs of
    // those modes have no door and win straight through their objective.
    this.goalLocked =
      this.winCondition === "door" &&
      ((this.spec.mode === "shooter" &&
        (this.spec.shooter?.requiredKills ?? 0) > 0) ||
        (this.spec.mode === "rush" &&
          (this.spec.rush?.requiredCollectibles ?? 0) > 0));
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
      // Drones shove instead of kill: near-surface hovers would otherwise
      // leave almost no safe standing room on narrow platforms.
      this.physics.add.overlap(this.player, this.targets, (_p, other) => {
        if (!(other as TargetRect).destroyed) {
          this.bumpPlayerOff(other as TargetRect);
        }
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
    if (this.spec.gauntlet) this.startGauntlet();

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
      // The survive clock only runs while the player braves the open —
      // camping the spawn safe zone must not run out the storm.
      if (
        this.winCondition === "survive" &&
        this.player.x >= SKYFALL_SAFE_ZONE_X
      ) {
        this.surviveElapsedMs += delta;
      }
      if (this.hudAccumulator >= HUD_INTERVAL_MS) {
        this.hudAccumulator = 0;
        this.emitHud();
      }
      if (this.timeLeftMs() === 0) {
        this.flashMessage("OUT OF TIME");
        this.restartRun();
        return;
      }
      if (this.surviveLeftMs() === 0) {
        this.flashMessage("STORM SURVIVED");
        this.finish();
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
    // A drone shove owns the player's velocity for a beat; input resumes after.
    if (time >= this.knockbackUntil) {
      body.setVelocityX(left && !right ? -speed : right && !left ? speed : 0);
    }
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
    this.updateEnemyShots();
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
    // No collider is ever registered against solids, hazards or the world
    // bounds: a shot passes straight through everything in its way and only
    // ever stops on a drone (or when it leaves the level).
    projectile.body.setCollideWorldBounds(false);
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
    // Range never cuts a shot short inside the level — already-published specs
    // carry a shorter stored range, which read as shots dying against scenery.
    const range = Math.max(projectileSpec.maxRangePx, this.spec.world.width);
    for (const projectile of [...this.projectiles]) {
      projectile.visual.setPosition(projectile.x, projectile.y);
      const traveled = Math.abs(projectile.x - projectile.spawnX);
      const outOfWorld =
        projectile.x < -30 || projectile.x > this.spec.world.width + 30;
      if (traveled > range || outOfWorld) {
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
      if (this.winCondition === "destroy_all") {
        this.flashMessage("ALL DRONES DOWN");
        // Short delay lets the last burst animation land before the results.
        this.time.delayedCall(400, () => this.finish());
      } else {
        this.unlockGoal();
      }
    }
  }

  /** Contact with a live drone shoves the player back instead of killing. */
  private bumpPlayerOff(target: TargetRect) {
    if (this.completed || this.time.now < this.knockbackUntil) return;
    this.knockbackUntil = this.time.now + KNOCKBACK_MS;
    const direction = this.player.x < target.x ? -1 : 1;
    this.player.body.setVelocity(
      direction * KNOCKBACK_VELOCITY_X,
      KNOCKBACK_VELOCITY_Y,
    );
    this.cameras.main.shake(90, 0.004);
  }

  // --------------------------------------------------------------- gauntlet

  private startGauntlet() {
    const gauntlet = this.spec.gauntlet;
    if (!gauntlet) return;
    this.gauntletTimer = this.time.addEvent({
      delay: gauntlet.intervalMs,
      loop: true,
      callback: () => this.fireTurretShot(),
    });
  }

  private turretMuzzle(): { x: number; y: number } {
    const gauntlet = this.spec.gauntlet;
    const turret = this.spec.entities.find(
      (entity) => entity.id === gauntlet?.turretId,
    );
    const bounds = turret?.bounds ?? {
      x: this.spec.world.width - 80,
      y: GROUND_TOP - 120,
      width: 70,
      height: 120,
    };
    return { x: bounds.x - 10, y: bounds.y + bounds.height * 0.35 };
  }

  private fireTurretShot() {
    const gauntlet = this.spec.gauntlet;
    if (!gauntlet || !this.started || this.completed) return;
    if (this.enemyShots.length >= 4) return;

    // Low shots skim the floor (jump them); high shots fly over at head
    // height (stay grounded). The mix keeps both instincts honest.
    const low = this.rng.next() < 0.6;
    const y = low ? GROUND_TOP - 22 : GROUND_TOP - 92;
    const muzzle = this.turretMuzzle();

    const flash = this.add.circle(muzzle.x, y, 7, this.palette.hazard, 0.9);
    flash.setDepth(9);
    this.tweens.add({
      targets: flash,
      radius: 20,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    const rect = this.add.rectangle(
      muzzle.x,
      y,
      PROJECTILE_SIZE,
      PROJECTILE_SIZE,
      this.palette.hazard,
    );
    this.physics.add.existing(rect);
    rect.setVisible(false);

    const shot = rect as Projectile;
    shot.body.setAllowGravity(false);
    shot.body.setVelocityX(-gauntlet.projectileSpeed);
    shot.spawnX = shot.x;
    const componentId =
      gauntlet.ammoComponentIds.length > 0
        ? gauntlet.ammoComponentIds[
            this.rng.int(0, gauntlet.ammoComponentIds.length - 1)
          ]
        : undefined;
    shot.visual = createProjectileVisual(this, componentId, PROJECTILE_SIZE + 8);
    shot.visual.setPosition(shot.x, shot.y);
    shot.visual.setDepth(9);
    this.tweens.add({
      targets: shot.visual,
      angle: -360,
      duration: 650,
      repeat: -1,
    });

    // Shots ignore every obstacle in their path — cover blocks are terrain,
    // not a projectile shield. Only the player (below) or the world edge
    // (updateEnemyShots) stops one.
    this.physics.add.overlap(this.player, shot, () => {
      this.removeEnemyShot(shot);
      this.killPlayer();
    });

    this.enemyShots.push(shot);
  }

  private updateEnemyShots() {
    for (const shot of [...this.enemyShots]) {
      shot.visual.setPosition(shot.x, shot.y);
      if (shot.x < -30) this.removeEnemyShot(shot);
    }
  }

  private removeEnemyShot(shot: Projectile) {
    const index = this.enemyShots.indexOf(shot);
    if (index >= 0) this.enemyShots.splice(index, 1);
    shot.visual.destroy(true);
    shot.destroy();
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
    if (this.shelterRows.length > 0) {
      const profile = SHELTER_MOVEMENT_PROFILES[this.spec.difficulty];
      this.shelterTimer = this.time.addEvent({
        delay: profile.cycleIntervalMs,
        loop: true,
        callback: () => this.shuffleShelters(profile),
      });
    }
  }

  /**
   * Once per cycle, at most one shelter per row either slides to a new spot
   * or briefly vanishes — difficulty controls how often and for how long.
   * A shelter already mid-move/vanish, or already gone, sits this roll out.
   */
  private shuffleShelters(profile: ShelterMovementProfile) {
    if (!this.started || this.completed) return;
    for (const row of this.shelterRows) {
      const index = this.rng.int(0, row.length - 1);
      const shelter = row[index];
      if (shelter.vanished || shelter.busy) continue;

      const hasVisibleSibling = row.some(
        (other) => other !== shelter && !other.vanished,
      );
      const canVanish = row.length === 1 || hasVisibleSibling;

      if (canVanish && this.rng.next() < profile.vanishChance) {
        this.vanishShelter(shelter, profile);
      } else if (this.rng.next() < profile.moveChance) {
        this.relocateShelter(shelter, row[index - 1], row[index + 1], profile);
      }
    }
  }

  /** Slides a shelter to a new spot, clamped between its row neighbours. */
  private relocateShelter(
    shelter: ShelterRuntime,
    prev: ShelterRuntime | undefined,
    next: ShelterRuntime | undefined,
    profile: ShelterMovementProfile,
  ) {
    const rect = shelter.rect;
    const halfWidth = rect.width / 2;
    const leftBound = prev
      ? prev.rect.x + prev.rect.width / 2 + MIN_SHELTER_GAP + halfWidth
      : SKYFALL_SAFE_ZONE_X + EDGE_MARGIN + halfWidth;
    const rightBound = next
      ? next.rect.x - next.rect.width / 2 - MIN_SHELTER_GAP - halfWidth
      : this.spec.world.width - EDGE_MARGIN - halfWidth;
    if (rightBound <= leftBound) return;

    const targetX = this.rng.int(Math.round(leftBound), Math.round(rightBound));
    if (Math.abs(targetX - rect.x) < 12) return;

    shelter.busy = true;
    this.tweens.add({
      targets: rect,
      x: targetX,
      duration: profile.tweenDurationMs,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        rect.body.updateFromGameObject();
        syncEntityArt(rect);
      },
      onComplete: () => {
        shelter.busy = false;
      },
    });
  }

  /** Fades a shelter out, drops it from `solids`, then restores it later. */
  private vanishShelter(shelter: ShelterRuntime, profile: ShelterMovementProfile) {
    shelter.busy = true;
    const fadeTargets: (Phaser.GameObjects.Container | Phaser.GameObjects.Text)[] =
      [shelter.rect.art];
    if (shelter.rect.artLabel) fadeTargets.push(shelter.rect.artLabel);

    this.tweens.add({
      targets: fadeTargets,
      alpha: 0,
      duration: 260,
      onComplete: () => {
        shelter.vanished = true;
        const solidIndex = this.solids.indexOf(shelter.rect);
        if (solidIndex >= 0) this.solids.splice(solidIndex, 1);
        this.time.delayedCall(profile.vanishDurationMs, () =>
          this.reappearShelter(shelter),
        );
      },
    });
  }

  private reappearShelter(shelter: ShelterRuntime) {
    if (this.completed) {
      shelter.busy = false;
      return;
    }
    if (!this.solids.includes(shelter.rect)) this.solids.push(shelter.rect);
    shelter.vanished = false;
    const fadeTargets: (Phaser.GameObjects.Container | Phaser.GameObjects.Text)[] =
      [shelter.rect.art];
    if (shelter.rect.artLabel) fadeTargets.push(shelter.rect.artLabel);

    this.tweens.add({
      targets: fadeTargets,
      alpha: 1,
      duration: 260,
      onComplete: () => {
        shelter.busy = false;
      },
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
    // Platforms are shelter: falling objects smash on whatever they hit
    // first, so ducking under level geometry is the survival strategy.
    this.physics.add.collider(faller, this.solids, () => this.poofFaller(faller));

    this.fallers.push(faller);
  }

  private updateFallers() {
    for (const faller of [...this.fallers]) {
      faller.visual.setPosition(faller.x, faller.y);
      if (faller.y >= GROUND_TOP - 8) {
        this.poofFaller(faller, GROUND_TOP - 10);
      }
    }
  }

  private poofFaller(faller: Faller, atY?: number) {
    if (!this.fallers.includes(faller)) return;
    const poofY = atY ?? faller.y;
    const poof = this.add.circle(
      faller.x,
      poofY,
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
    this.registerDodge(faller.x, poofY);
  }

  /** Dodge-storm scoring: every harmless smash counts while braving the storm. */
  private registerDodge(x: number, y: number) {
    const dodgeCount = this.spec.skyfall?.dodgeCount;
    if (this.winCondition !== "dodge" || !dodgeCount) return;
    if (!this.started || this.completed) return;
    // Camping the spawn corner must not bank dodges for free.
    if (this.player.x < SKYFALL_SAFE_ZONE_X) return;

    this.avoided += 1;
    this.emitHud();

    const tally = this.add.text(x, y - 14, `+1`, {
      fontFamily: "monospace",
      fontSize: "16px",
      color: this.palette.label,
    });
    tally.setOrigin(0.5, 0.5);
    tally.setDepth(9);
    this.tweens.add({
      targets: tally,
      y: tally.y - 30,
      alpha: 0,
      duration: 600,
      ease: "Sine.easeOut",
      onComplete: () => tally.destroy(),
    });

    if (this.avoided >= dodgeCount) {
      this.flashMessage("STORM CLEARED");
      this.time.delayedCall(400, () => this.finish());
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

  /** Milliseconds left to survive in skyfall mode; 0 means the player won. */
  private surviveLeftMs(): number | undefined {
    const surviveSeconds = this.spec.skyfall?.surviveSeconds;
    if (this.winCondition !== "survive" || !surviveSeconds || this.completed) {
      return undefined;
    }
    return Math.max(
      0,
      Math.round(surviveSeconds * 1000 - this.surviveElapsedMs),
    );
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
      if (this.winCondition === "collect_all") {
        this.finish();
      } else {
        this.unlockGoal();
      }
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
    respawnPlayer(this.player, this.spec);
    this.cameras.main.shake(120, 0.006);
    // Dying repeatedly must not run out the storm for free.
    if (this.winCondition === "survive" && this.surviveElapsedMs > 0) {
      this.surviveElapsedMs = 0;
      this.flashMessage("TIMER RESET");
    }
    if (this.winCondition === "dodge" && this.avoided > 0) {
      this.avoided = 0;
      this.flashMessage("STREAK RESET");
    }
    this.emitHud();
    this.bus.emit("gameEvent", {
      type: "player_died",
      payload: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        elapsedMs: Math.round(this.elapsedMs),
      },
    });
  }

  private finish() {
    if (this.completed) return;
    this.completed = true;
    this.player.body.setVelocity(0, 0);
    this.skyfallTimer?.remove();
    this.gauntletTimer?.remove();
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
      payload: { elapsedMs: result.elapsedMs, deaths: result.deaths },
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
      timeLeftMs: this.timeLeftMs() ?? this.surviveLeftMs(),
      avoided: this.winCondition === "dodge" ? this.avoided : undefined,
      dodgeTarget:
        this.winCondition === "dodge"
          ? this.spec.skyfall?.dodgeCount
          : undefined,
      goalLocked: this.goalLocked,
    });
  }
}
