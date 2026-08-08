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
  metadata?: Record<string, string | number | boolean>;
};

export type GameSpec = {
  schemaVersion: 1;
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
