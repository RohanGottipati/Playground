import {
  ENTITY_VISUAL_KINDS,
  type EntityVisualKind,
  type EntityVisualSpec,
  type GameEntitySpec,
} from "@/game/types";
import {
  defaultComponentIndex,
  type ComponentIndex,
} from "@/game/components/selectComponent";
import type { Rng } from "@/game/generation/rng";

const WORD_SEPARATOR = /[^a-z0-9]+/g;

function words(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .toLowerCase()
      .split(WORD_SEPARATOR)
      .filter(Boolean),
  );
}

function hasAny(values: Set<string>, candidates: readonly string[]): boolean {
  return candidates.some((candidate) => values.has(candidate));
}

function propertiesFor(entity: GameEntitySpec): Set<string> {
  const stored = entity.metadata?.properties;
  return words(typeof stored === "string" ? stored : undefined);
}

function roleFor(entity: GameEntitySpec): string {
  return typeof entity.metadata?.role === "string" ? entity.metadata.role : "";
}

export function isEntityVisualKind(value: unknown): value is EntityVisualKind {
  return (
    typeof value === "string" &&
    (ENTITY_VISUAL_KINDS as readonly string[]).includes(value)
  );
}

/**
 * Selects recognizable art from the final mechanic plus the photographed
 * object's label and properties. This is intentionally deterministic so a
 * published game renders exactly like its creation preview.
 */
export function selectEntityVisualKind(entity: GameEntitySpec): EntityVisualKind {
  const labels = words(entity.sourceLabel);
  const properties = propertiesFor(entity);
  const role = roleFor(entity);

  switch (entity.mechanic) {
    case "static_platform":
      if (role === "helper") return "helper-platform";
      if (
        hasAny(labels, [
          "pencil",
          "pen",
          "ruler",
          "chopstick",
          "straw",
          "cable",
          "rope",
        ]) ||
        (properties.has("long") && properties.has("thin"))
      ) {
        return "pencil-bridge";
      }
      if (
        hasAny(labels, ["bottle", "can", "jar", "vase", "thermos"]) ||
        properties.has("tall") ||
        role === "vertical_platform"
      ) {
        return "bottle-tower";
      }
      if (
        hasAny(labels, ["box", "crate", "container", "case"]) ||
        properties.has("container")
      ) {
        return "crate-platform";
      }
      return "book-platform";

    case "moving_platform":
      return "moving-platform";

    case "bounce_pad":
      if (hasAny(labels, ["mug", "cup", "bowl"])) return "mug-bouncer";
      if (
        hasAny(labels, ["trampoline", "beanbag", "sponge", "ball", "castle"]) ||
        properties.has("soft") ||
        properties.has("springy")
      ) {
        return "trampoline";
      }
      return "bounce-pad";

    case "hazard":
      if (hasAny(labels, ["scissors", "shears"])) return "scissors";
      if (
        hasAny(labels, ["saw", "blade", "disc", "wheel"]) ||
        (properties.has("round") && properties.has("sharp"))
      ) {
        return "saw-blade";
      }
      return "spike-strip";

    case "collectible":
      if (hasAny(labels, ["coin", "token"])) return "coin";
      if (hasAny(labels, ["key"])) return "key";
      if (hasAny(labels, ["battery", "cell"])) return "battery";
      if (hasAny(labels, ["eraser", "rubber", "airpods", "earbuds", "case"])) {
        return "eraser";
      }
      return "gem";

    case "portal":
      return "portal-gate";

    case "target":
      return "drone-target";

    case "goal":
      return "exit-door";
  }
}

export function resolveEntityVisual(
  entity: GameEntitySpec,
  index: ComponentIndex = defaultComponentIndex,
  rng?: Rng,
): EntityVisualSpec {
  const stored = entity.visual?.kind;
  const kind = isEntityVisualKind(stored)
    ? stored
    : selectEntityVisualKind(entity);
  // Drone targets use the built-in drawn art unless a template pinned a
  // photo-object sprite (the "shoot the flying photo props" treatment).
  if (entity.mechanic === "target") {
    const pinned = entity.visual?.componentId;
    return index.isSelectableEntityComponent(pinned, "target")
      ? { kind: "drone-target", componentId: pinned }
      : { kind: "drone-target" };
  }
  const storedComponentId = entity.visual?.componentId;
  return {
    kind,
    componentId: index.isSelectableEntityComponent(
      storedComponentId,
      entity.mechanic,
    )
      ? storedComponentId
      : index.selectComponentForEntity(entity, kind, rng).id,
  };
}

export function withResolvedVisual(
  entity: GameEntitySpec,
  index: ComponentIndex = defaultComponentIndex,
  rng?: Rng,
): GameEntitySpec {
  return { ...entity, visual: resolveEntityVisual(entity, index, rng) };
}
