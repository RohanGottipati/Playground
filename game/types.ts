export type MechanicType =
  | "static_platform"
  | "moving_platform"
  | "bounce_pad"
  | "hazard"
  | "collectible"
  | "portal"
  | "target"
  | "goal";

/**
 * Every generated level plays one of these modes. Selection is seeded per run
 * so the same photo produces different games on different attempts.
 */
export const GAME_MODES = [
  "classic",
  "shooter",
  "skyfall",
  "rush",
  "gauntlet",
] as const;
export type GameMode = (typeof GAME_MODES)[number];

/** Human-readable, mode-specific instructions shown in the pre-game popup. */
export type GameRules = {
  headline: string;
  objective: string;
  howToPlay: string[];
  controls: string[];
  tip?: string;
};

/** Straight-flying projectile the player fires in shooter mode. */
export type ProjectileSpec = {
  /** Generic display name for the ammo, e.g. "donut". */
  label: string;
  /** Catalog component rendered as the projectile sprite, when available. */
  componentId?: string;
  speed: number;
  cooldownMs: number;
  maxRangePx: number;
};

/** Falling-object pressure applied in skyfall mode. */
export type SkyfallSpec = {
  /** Generic display name for what is falling, e.g. "staplers". */
  label: string;
  intervalMs: number;
  fallSpeed: number;
  maxConcurrent: number;
  /** Catalog components cycled for the falling sprites. */
  componentIds: string[];
  /**
   * Survive-the-storm win condition: stay alive this long to win. Absent on
   * legacy skyfall specs, which win at the exit door instead.
   */
  surviveSeconds?: number;
  /**
   * Dodge-the-storm win condition: the run is won once this many falling
   * objects have smashed harmlessly while the player is out in the storm.
   * Takes precedence over surviveSeconds when both are present.
   */
  dodgeCount?: number;
};

/**
 * Gauntlet mode: a machine at the far right hurls projectiles at the player,
 * who must cross the whole course and reach the finish marker beside it.
 */
export type GauntletSpec = {
  /** Milliseconds between turret volleys. */
  intervalMs: number;
  /** Horizontal speed of turret projectiles, in px/s. */
  projectileSpeed: number;
  /** Generic display name for what the machine fires, e.g. "soda can". */
  ammoLabel: string;
  /** Catalog components cycled for the fired sprites. */
  ammoComponentIds: string[];
  /** Entity id of the hazard that visually anchors the firing machine. */
  turretId: string;
};

export type ShooterSpec = {
  /**
   * Targets that must all be destroyed. New specs win the moment the last one
   * falls; legacy specs (which carry a goal entity) unlock a door instead.
   */
  requiredKills: number;
};

export type RushSpec = {
  /**
   * Collectibles that must all be gathered. New specs win on the final pickup;
   * legacy specs (which carry a goal entity) unlock a door instead.
   */
  requiredCollectibles: number;
  /** Soft time pressure; running out restarts the run, never bricks it. */
  timeLimitSeconds: number;
};

/** Result of the Magic Patterns design call made during generation. */
export type MagicPatternsInfo = {
  designId?: string;
  editorUrl?: string;
  previewUrl?: string;
  /** Palette accents adapted from the returned design source code. */
  palette?: Partial<Record<
    "background" | "backgroundAccent" | "platform" | "collectible" | "goal" | "hazard",
    number
  >>;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Stable, serializable art choices stored with generated levels. Physics stays
 * mechanic-driven; these values only select the illustrated Phaser treatment.
 */
export const ENTITY_VISUAL_KINDS = [
  "book-platform",
  "pencil-bridge",
  "bottle-tower",
  "crate-platform",
  "helper-platform",
  "moving-platform",
  "bounce-pad",
  "mug-bouncer",
  "trampoline",
  "spike-strip",
  "scissors",
  "saw-blade",
  "coin",
  "gem",
  "eraser",
  "key",
  "battery",
  "portal-gate",
  "exit-door",
  "drone-target",
  "donut",
] as const;

export type EntityVisualKind = (typeof ENTITY_VISUAL_KINDS)[number];

export type EntityVisualSpec = {
  kind: EntityVisualKind;
  /** Stable component-catalog row used to select this treatment. */
  componentId?: string;
};

export type EntityMovement = {
  axis: "x" | "y";
  distance: number;
  speed: number;
};

export type GameEntitySpec = {
  id: string;
  sourceObjectId?: string;
  sourceLabel?: string;
  mechanic: MechanicType;
  bounds: Rect;
  movement?: EntityMovement;
  visual?: EntityVisualSpec;
  metadata?: Record<string, string | number | boolean>;
};

export type GameSpec = {
  schemaVersion: 1;
  /** Absent on legacy games, which resolve compatible visuals at runtime. */
  visualVersion?: 1;
  title: string;
  slug?: string;
  theme: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Absent on legacy games, which play as "classic". */
  mode?: GameMode;
  /**
   * Hand-built template this level was cut from. Stored so the next
   * generation can refuse to hand back a layout the player just played.
   * Absent on legacy games built before the template pipeline.
   */
  templateId?: string;
  /** Seed used for this run's mode, layout accents and titles. */
  seed?: number;
  /** Mode-specific popup rules; legacy games get a fallback at runtime. */
  rules?: GameRules;
  projectile?: ProjectileSpec;
  skyfall?: SkyfallSpec;
  shooter?: ShooterSpec;
  rush?: RushSpec;
  gauntlet?: GauntletSpec;
  magicPatterns?: MagicPatternsInfo;
  world: {
    width: number;
    height: number;
    gravityY: number;
  };
  player: {
    spawnX: number;
    spawnY: number;
    moveSpeed: number;
    jumpVelocity: number;
    maxJumps: 1 | 2;
    canShoot?: boolean;
  };
  entities: GameEntitySpec[];
  validation: {
    reachable: boolean;
    repaired: boolean;
    repairActions: string[];
    estimatedOptimalTimeSeconds: number;
    /**
     * Generator pipeline revision. Absent on legacy specs; >= 2 opts into the
     * strict completability checks in runtimeSafety.
     */
    pipelineVersion?: number;
  };
  source: {
    imageUrl: string;
    detectedObjectCount: number;
  };
};

export type GameEventType =
  | "image_uploaded"
  | "generation_started"
  | "generation_completed"
  | "generation_failed"
  | "game_published"
  | "game_started"
  | "player_died"
  | "collectible_collected"
  | "target_destroyed"
  | "checkpoint_reached"
  | "game_completed"
  | "game_restarted"
  | "game_remixed"
  | "mechanic_discovered"
  | "death"
  | "clear";
