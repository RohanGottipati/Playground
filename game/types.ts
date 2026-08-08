export type MechanicType =
  | "static_platform"
  | "moving_platform"
  | "bounce_pad"
  | "hazard"
  | "collectible"
  | "portal"
  | "goal";

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
  };
  entities: GameEntitySpec[];
  validation: {
    reachable: boolean;
    repaired: boolean;
    repairActions: string[];
    estimatedOptimalTimeSeconds: number;
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
  | "checkpoint_reached"
  | "game_completed"
  | "game_restarted"
  | "game_remixed"
  | "mechanic_discovered";
