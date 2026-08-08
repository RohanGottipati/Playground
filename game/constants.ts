export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 900;

export const GRAVITY_Y = 1100;
export const MOVE_SPEED = 260;
export const JUMP_VELOCITY = -500;
export const MAX_FALL_SPEED = 900;

export const PLAYER_WIDTH = 34;
export const PLAYER_HEIGHT = 48;

export const MIN_PLATFORM_WIDTH = 90;
export const MAX_PLATFORM_WIDTH = 600;
export const MIN_PLATFORM_HEIGHT = 24;
export const MAX_PLATFORM_HEIGHT = 260;

export const MIN_HAZARD_SIZE = 28;
export const MAX_HAZARD_SIZE = 220;
export const COLLECTIBLE_SIZE = 34;
export const PORTAL_WIDTH = 54;
export const PORTAL_HEIGHT = 84;
export const GOAL_WIDTH = 56;
export const GOAL_HEIGHT = 80;

export const GROUND_HEIGHT = 70;
export const GROUND_TOP = WORLD_HEIGHT - GROUND_HEIGHT;

/** Conservative jump envelope used for reachability. Not the theoretical maximum. */
export const SAFE_MAX_HORIZONTAL_GAP = 220;
export const SAFE_MAX_UPWARD_DELTA = 150;
export const SAFE_MAX_DOWNWARD_DELTA = 320;
export const MIN_LANDING_WIDTH = 64;

export const MOVING_PLATFORM_MIN_DISTANCE = 60;
export const MOVING_PLATFORM_MAX_DISTANCE = 260;
export const MOVING_PLATFORM_MIN_SPEED = 30;
export const MOVING_PLATFORM_MAX_SPEED = 120;

export const BOUNCE_VELOCITY = -780;

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
