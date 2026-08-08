import {
  COLLECTIBLE_SIZE,
  GROUND_TOP,
  MAX_HAZARD_SIZE,
  MAX_PLATFORM_HEIGHT,
  MAX_PLATFORM_WIDTH,
  MIN_HAZARD_SIZE,
  MIN_PLATFORM_HEIGHT,
  MIN_PLATFORM_WIDTH,
  MOVING_PLATFORM_MAX_DISTANCE,
  MOVING_PLATFORM_MAX_SPEED,
  MOVING_PLATFORM_MIN_DISTANCE,
  MOVING_PLATFORM_MIN_SPEED,
  PORTAL_HEIGHT,
  PORTAL_WIDTH,
  WORLD_WIDTH,
} from "@/game/constants";
import type { GameEntitySpec, MechanicType, Rect } from "@/game/types";
import { clamp, type NormalizedObject } from "./normalizeObjects";

/** Mechanic chosen for an object before geometry is finalized. */
export function mechanicForObject(object: NormalizedObject): MechanicType {
  const properties = new Set(object.properties);

  switch (object.role) {
    case "platform":
    case "bridge":
    case "vertical_platform":
    case "goal_landmark":
      return "static_platform";
    case "moving_platform":
      return "moving_platform";
    case "bounce_pad":
      return "bounce_pad";
    case "hazard":
      return "hazard";
    case "collectible":
      return "collectible";
    case "portal":
      return "portal";
    case "decoration":
      if (properties.has("sharp")) return "hazard";
      if (properties.has("springy") || properties.has("soft")) return "bounce_pad";
      return "collectible";
    default:
      return "static_platform";
  }
}

function clampPlatformRect(bounds: Rect, tall: boolean): Rect {
  const width = clamp(bounds.width, MIN_PLATFORM_WIDTH, MAX_PLATFORM_WIDTH);
  const height = tall
    ? clamp(bounds.height, MIN_PLATFORM_HEIGHT * 2, MAX_PLATFORM_HEIGHT)
    : clamp(bounds.height, MIN_PLATFORM_HEIGHT, MAX_PLATFORM_HEIGHT);
  return positionRect(bounds, width, height);
}

function positionRect(bounds: Rect, width: number, height: number): Rect {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const x = clamp(centerX - width / 2, 0, WORLD_WIDTH - width);
  const y = clamp(centerY - height / 2, 40, GROUND_TOP - height - 8);
  return { x, y, width, height };
}

function movementFor(object: NormalizedObject) {
  const horizontal =
    object.bounds.width >= object.bounds.height ||
    object.properties.includes("flexible");
  const seed = object.bounds.width + object.bounds.height;
  const distance = clamp(
    Math.round(seed / 3),
    MOVING_PLATFORM_MIN_DISTANCE,
    MOVING_PLATFORM_MAX_DISTANCE,
  );
  const speed = clamp(
    Math.round(40 + (seed % 60)),
    MOVING_PLATFORM_MIN_SPEED,
    MOVING_PLATFORM_MAX_SPEED,
  );
  return { axis: horizontal ? ("x" as const) : ("y" as const), distance, speed };
}

/**
 * Turns normalized objects into entity specs with playable collision geometry.
 * Portals are only kept in pairs; extra portals fall back to collectibles.
 */
export function assignMechanics(objects: NormalizedObject[]): GameEntitySpec[] {
  const entities: GameEntitySpec[] = [];
  let portalCount = 0;

  for (const object of objects) {
    let mechanic = mechanicForObject(object);

    if (mechanic === "portal") {
      if (portalCount >= 2) {
        mechanic = "collectible";
      } else {
        portalCount += 1;
      }
    }

    const tall =
      object.role === "vertical_platform" || object.properties.includes("tall");

    let bounds: Rect;
    switch (mechanic) {
      case "static_platform":
      case "moving_platform":
        bounds = clampPlatformRect(object.bounds, tall);
        break;
      case "bounce_pad":
        bounds = positionRect(
          object.bounds,
          clamp(object.bounds.width, MIN_PLATFORM_WIDTH, 200),
          MIN_PLATFORM_HEIGHT,
        );
        break;
      case "hazard": {
        const size = clamp(
          Math.max(object.bounds.width, object.bounds.height) * 0.6,
          MIN_HAZARD_SIZE,
          MAX_HAZARD_SIZE,
        );
        bounds = positionRect(object.bounds, size, MIN_HAZARD_SIZE);
        break;
      }
      case "collectible":
        bounds = positionRect(object.bounds, COLLECTIBLE_SIZE, COLLECTIBLE_SIZE);
        break;
      case "portal":
        bounds = positionRect(object.bounds, PORTAL_WIDTH, PORTAL_HEIGHT);
        break;
      default:
        bounds = clampPlatformRect(object.bounds, tall);
        break;
    }

    entities.push({
      id: `e-${object.id}`,
      sourceObjectId: object.id,
      sourceLabel: object.label,
      mechanic,
      bounds,
      movement: mechanic === "moving_platform" ? movementFor(object) : undefined,
      metadata: {
        role: object.role,
        confidence: Number(object.confidence.toFixed(2)),
        properties: object.properties.join(","),
        normalizedX: Number(object.normalizedBounds.x.toFixed(4)),
        normalizedY: Number(object.normalizedBounds.y.toFixed(4)),
        normalizedWidth: Number(object.normalizedBounds.width.toFixed(4)),
        normalizedHeight: Number(object.normalizedBounds.height.toFixed(4)),
      },
    });
  }

  if (portalCount === 1) {
    // A single portal has nothing to link to, so it becomes a collectible.
    const index = entities.findIndex((entity) => entity.mechanic === "portal");
    if (index >= 0) {
      const entity = entities[index];
      entities[index] = {
        ...entity,
        mechanic: "collectible",
        bounds: positionRect(entity.bounds, COLLECTIBLE_SIZE, COLLECTIBLE_SIZE),
      };
    }
  }

  return entities;
}
