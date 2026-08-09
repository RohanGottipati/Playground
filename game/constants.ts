export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 900;

export const GRAVITY_Y = 1100;
export const MOVE_SPEED = 260;
// Jump apex = v^2 / 2g ≈ 142px. The reachability validator must always stay
// well inside this envelope, otherwise generated levels become uncompletable.
export const JUMP_VELOCITY = -560;
export const MAX_FALL_SPEED = 900;

export const PLAYER_WIDTH = 34;
export const PLAYER_HEIGHT = 48;

export const MIN_PLATFORM_WIDTH = 90;
export const MAX_PLATFORM_WIDTH = 600;
export const MIN_PLATFORM_HEIGHT = 24;
export const MAX_PLATFORM_HEIGHT = 260;

export const MIN_HAZARD_SIZE = 28;
// Full-jump horizontal flight ≈ 264px; hazards must stay clearable with margin.
export const MAX_HAZARD_SIZE = 140;
export const COLLECTIBLE_SIZE = 34;
export const PORTAL_WIDTH = 54;
export const PORTAL_HEIGHT = 84;
export const GOAL_WIDTH = 56;
export const GOAL_HEIGHT = 80;

export const TARGET_SIZE = 46;
export const PROJECTILE_SPEED = 640;
export const PROJECTILE_COOLDOWN_MS = 320;
/**
 * Player shots fly the full width of the level and pass through platforms,
 * hazards and scenery alike — nothing but a drone stops one. A shorter range
 * made distant drones look unhittable, as if the shot had struck the geometry
 * in front of them.
 */
export const PROJECTILE_MAX_RANGE = WORLD_WIDTH;
export const PROJECTILE_SIZE = 22;

export const SKYFALL_MIN_INTERVAL_MS = 900;
export const SKYFALL_MAX_INTERVAL_MS = 2600;
export const SKYFALL_MIN_FALL_SPEED = 170;
export const SKYFALL_MAX_FALL_SPEED = 340;
export const SKYFALL_MAX_CONCURRENT = 6;
export const SKYFALL_OBJECT_SIZE = 42;
/** Falling objects never spawn inside the spawn-safe corridor. */
export const SKYFALL_SAFE_ZONE_X = 170;

export const RUSH_MIN_TIME_LIMIT_S = 45;
export const RUSH_TIME_PER_COLLECTIBLE_S = 9;

export const GROUND_HEIGHT = 70;
export const GROUND_TOP = WORLD_HEIGHT - GROUND_HEIGHT;

/**
 * Conservative jump envelope used for reachability. Deliberately far inside
 * the theoretical physics maximum (apex 142px, flight 264px) so an average
 * player can always finish a validated route.
 */
export const SAFE_MAX_HORIZONTAL_GAP = 170;
// 112 leaves ≥30px of apex clearance; the gap allowance shrinks as the
// upward delta approaches this bound (see canJump).
export const SAFE_MAX_UPWARD_DELTA = 112;
export const SAFE_MAX_DOWNWARD_DELTA = 320;
export const MIN_LANDING_WIDTH = 64;
/** Ground hazards must leave at least this much standable space between them. */
export const MIN_GROUND_HAZARD_GAP = 230;

export const MOVING_PLATFORM_MIN_DISTANCE = 60;
export const MOVING_PLATFORM_MAX_DISTANCE = 260;
export const MOVING_PLATFORM_MIN_SPEED = 30;
export const MOVING_PLATFORM_MAX_SPEED = 120;

// Bounce apex = v^2 / 2g ≈ 290px; the validator allows at most ~229px of it.
export const BOUNCE_VELOCITY = -800;

export const MAX_HELPER_PLATFORMS = 3;
export const MAX_DETECTED_OBJECTS = 15;

export const THEMES = [
  "arcade",
  "space",
  "forest",
  "factory",
  "neon",
  "paper",
  "kitchen",
  "default",
] as const;

export type Theme = (typeof THEMES)[number];
