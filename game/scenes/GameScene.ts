import Phaser from "phaser";
import {
  BOUNCE_VELOCITY,
  GROUND_HEIGHT,
  GROUND_TOP,
  MAX_FALL_SPEED,
} from "@/game/constants";
import type { ControlState, GameBus } from "@/game/bus";
import { paletteForTheme, type ThemePalette } from "@/game/theme";
import type { GameEntitySpec, GameSpec } from "@/game/types";
import { createPlayer, respawnPlayer, type PlayerObject } from "@/game/entities/Player";
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

const PORTAL_COOLDOWN_MS = 900;
const HUD_INTERVAL_MS = 100;

type CollectibleRect = StaticRect & { collected?: boolean };

export class GameScene extends Phaser.Scene {
  private spec!: GameSpec;
  private bus!: GameBus;
  private controls!: ControlState;
  private palette!: ThemePalette;
  private player!: PlayerObject;
  private collectibles: CollectibleRect[] = [];
  private portals: StaticRect[] = [];
  private keys!: {
    left: Phaser.Input.Keyboard.Key[];
    right: Phaser.Input.Keyboard.Key[];
    jump: Phaser.Input.Keyboard.Key[];
    restart: Phaser.Input.Keyboard.Key[];
  };

  private elapsedMs = 0;
  private deaths = 0;
  private collected = 0;
  private completed = false;
  private hudAccumulator = 0;
  private portalCooldownUntil = 0;
  private jumpWasDown = false;

  constructor() {
    super("GameScene");
  }

  create() {
    this.spec = this.registry.get("spec") as GameSpec;
    this.bus = this.registry.get("bus") as GameBus;
    this.controls = this.registry.get("controls") as ControlState;
    this.palette = paletteForTheme(this.spec.theme);

    this.elapsedMs = 0;
    this.deaths = 0;
    this.collected = 0;
    this.completed = false;
    this.collectibles = [];
    this.portals = [];

    const { width, height, gravityY } = this.spec.world;
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = gravityY;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setBackgroundColor(this.palette.background);

    this.drawBackdrop();

    const solids: Phaser.GameObjects.GameObject[] = [this.createGround()];
    const bouncePads: Phaser.GameObjects.GameObject[] = [];
    const hazards: Phaser.GameObjects.GameObject[] = [];
    let goal: StaticRect | undefined;

    for (const entity of this.spec.entities) {
      switch (entity.mechanic) {
        case "static_platform":
          solids.push(this.labelled(createStaticPlatform(this, entity, this.palette), entity));
          break;
        case "moving_platform":
          solids.push(this.labelled(createMovingPlatform(this, entity, this.palette), entity));
          break;
        case "bounce_pad":
          bouncePads.push(this.labelled(createBouncePad(this, entity, this.palette), entity));
          break;
        case "hazard":
          hazards.push(this.labelled(createHazard(this, entity, this.palette), entity));
          break;
        case "collectible": {
          const collectible = this.labelled(
            createCollectible(this, entity, this.palette),
            entity,
          ) as CollectibleRect;
          this.collectibles.push(collectible);
          break;
        }
        case "portal":
          this.portals.push(
            this.labelled(createPortal(this, entity, this.palette), entity) as StaticRect,
          );
          break;
        case "goal":
          goal = createGoal(this, entity, this.palette);
          break;
      }
    }

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
    if (this.portals.length === 2) {
      this.physics.add.overlap(this.player, this.portals, (_p, other) =>
        this.teleport(other as StaticRect),
      );
    }
    if (goal) {
      this.physics.add.overlap(this.player, goal, () => this.finish());
    }

    this.registerKeys();
    this.emitHud();
    this.bus.emit("ready", undefined);
    this.bus.emit("gameEvent", { type: "game_started" });
  }

  update(_time: number, delta: number) {
    if (!this.player) return;

    if (!this.completed) {
      this.elapsedMs += delta;
      this.hudAccumulator += delta;
      if (this.hudAccumulator >= HUD_INTERVAL_MS) {
        this.hudAccumulator = 0;
        this.emitHud();
      }
    }

    const left = this.controls.left || this.isDown(this.keys.left);
    const right = this.controls.right || this.isDown(this.keys.right);
    const jump = this.controls.jump || this.isDown(this.keys.jump);
    const restart = this.controls.restart || this.isDown(this.keys.restart);

    const body = this.player.body;
    const speed = this.spec.player.moveSpeed;
    body.setVelocityX(left && !right ? -speed : right && !left ? speed : 0);
    if (body.velocity.y > MAX_FALL_SPEED) body.setVelocityY(MAX_FALL_SPEED);

    const onGround = body.blocked.down || body.touching.down;
    if (jump && !this.jumpWasDown && onGround && !this.completed) {
      body.setVelocityY(this.spec.player.jumpVelocity);
    }
    this.jumpWasDown = jump;

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
      this.keys = { left: [], right: [], jump: [], restart: [] };
      return;
    }
    const add = (codes: string[]) => codes.map((code) => keyboard.addKey(code));
    this.keys = {
      left: add(["A", "LEFT"]),
      right: add(["D", "RIGHT"]),
      jump: add(["W", "UP", "SPACE"]),
      restart: add(["R"]),
    };
    keyboard.addCapture(["A", "D", "W", "S", "LEFT", "RIGHT", "UP", "DOWN", "SPACE", "R"]);
  }

  private drawBackdrop() {
    const { width, height } = this.spec.world;
    const backdrop = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      this.palette.backgroundAccent,
    );
    backdrop.setAlpha(0.35);
    backdrop.setDepth(-20);
    backdrop.setScrollFactor(0.2);

    for (let index = 0; index < 12; index += 1) {
      const stripe = this.add.rectangle(
        (index / 12) * width + 40,
        height / 2,
        6,
        height,
        this.palette.platform,
      );
      stripe.setAlpha(0.06);
      stripe.setDepth(-19);
      stripe.setScrollFactor(0.35);
    }
  }

  private createGround(): StaticRect {
    const { width } = this.spec.world;
    const ground = this.add.rectangle(
      width / 2,
      GROUND_TOP + GROUND_HEIGHT / 2,
      width,
      GROUND_HEIGHT,
      this.palette.ground,
    );
    ground.setStrokeStyle(4, 0x000000, 0.35);
    this.physics.add.existing(ground, true);
    return ground as StaticRect;
  }

  /** Small source-object label so the physical origin stays visible. */
  private labelled<T extends Phaser.GameObjects.Rectangle>(
    object: T,
    entity: GameEntitySpec,
  ): T {
    if (!entity.sourceLabel) return object;
    const text = this.add.text(
      object.x,
      object.y - object.height / 2 - 14,
      entity.sourceLabel.slice(0, 18),
      {
        fontFamily: "monospace",
        fontSize: "13px",
        color: this.palette.label,
      },
    );
    text.setOrigin(0.5, 0.5);
    text.setAlpha(0.75);
    text.setDepth(5);
    return object;
  }

  private collect(collectible: CollectibleRect) {
    if (collectible.collected) return;
    collectible.collected = true;
    collectible.destroy();
    this.collected += 1;
    this.emitHud();
    this.bus.emit("gameEvent", {
      type: "collectible_collected",
      payload: { total: this.collected },
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
    const result = {
      elapsedMs: Math.round(this.elapsedMs),
      deaths: this.deaths,
      collectibles: this.collected,
      totalCollectibles: this.collectibles.length,
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
    });
  }
}
