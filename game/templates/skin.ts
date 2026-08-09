import { defaultComponentIndex } from "@/game/components/selectComponent";
import {
  normalizeObjects,
  type NormalizedObject,
} from "@/game/generation/normalizeObjects";
import type {
  EntityVisualKind,
  GameEntitySpec,
  MechanicType,
} from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";

/**
 * Everything the photo contributes to a hardcoded template: labels and
 * bundled component ids. Layouts are fixed per template; the photo only
 * decides what each fixed slot looks like.
 */
export type TemplateSkin = {
  /** The photo's star object — the machine in gauntlet, the storm source in dodge. */
  starLabel: string;
  /** Hazard-compatible component for the firing machine (object art or turret). */
  starComponentId: string;
  ammoLabel: string;
  ammoComponentIds: string[];
  fallerLabel: string;
  fallerComponentIds: string[];
  /** Labels cycled across the fixed platform/cover/shelter slots. */
  platformLabels: string[];
  collectibleLabels: string[];
  /**
   * Photo objects that resolved to exact sprite art, cycled across shooter
   * target slots so drones look like the photo's props flying around.
   */
  targetSprites: { label: string; componentId: string }[];
  /** Every detected label, for rules text. */
  objectLabels: string[];
  detectedObjectCount: number;
};

const MACHINE_WORDS = [
  "machine",
  "vending",
  "fridge",
  "refrigerator",
  "microwave",
  "toaster",
  "oven",
  "kettle",
  "blender",
  "printer",
  "computer",
  "laptop",
  "monitor",
  "screen",
  "tv",
  "television",
  "console",
  "speaker",
  "robot",
  "fan",
  "camera",
  "keyboard",
  "washing",
  "dryer",
  "boombox",
  "jukebox",
  "arcade",
];

const AMMO_WORDS = [
  "can",
  "bottle",
  "ball",
  "donut",
  "doughnut",
  "apple",
  "orange",
  "egg",
  "coin",
  "cup",
  "mug",
  "dice",
  "battery",
  "eraser",
  "cookie",
  "candy",
  "sock",
  "marble",
  "frisbee",
  "lollipop",
  "paperclip",
  "nail",
];

function wordsOf(label: string): string[] {
  return label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function matchesAny(label: string, vocabulary: readonly string[]): boolean {
  const words = wordsOf(label);
  return vocabulary.some((entry) => words.includes(entry));
}

function area(object: NormalizedObject): number {
  return object.bounds.width * object.bounds.height;
}

function probeEntity(label: string, mechanic: MechanicType): GameEntitySpec {
  return {
    id: `skin-probe-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    sourceLabel: label,
    mechanic,
    bounds: { x: 0, y: 0, width: 60, height: 60 },
  };
}

/**
 * Resolves a label to a bundled everyday-object sprite id, or undefined when
 * only a generic drawn fallback would match. Deterministic: no rng.
 */
export function objectComponentIdFor(
  label: string,
  mechanic: MechanicType,
  kind: EntityVisualKind,
): string | undefined {
  const entry = defaultComponentIndex.selectComponentForEntity(
    probeEntity(label, mechanic),
    kind,
  );
  return entry.metadata.componentType === "object-sprite" ? entry.id : undefined;
}

/** Curated ammo per star object, used when the photo has no small props. */
function fallbackAmmoLabel(starLabel: string): string {
  const words = wordsOf(starLabel);
  if (words.includes("vending") || words.includes("fridge") || words.includes("refrigerator")) {
    return "tin can";
  }
  if (words.includes("toaster") || words.includes("oven")) return "cookie";
  if (words.includes("kettle") || words.includes("mug") || words.includes("cup")) {
    return "mug";
  }
  if (words.includes("printer") || words.includes("laptop") || words.includes("computer") || words.includes("keyboard")) {
    return "eraser";
  }
  return "donut";
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

/**
 * Distills the scene analysis into template skin choices. This is the only
 * place the photo influences a game: which bundled components dress the
 * hardcoded slots. Deterministic for a given analysis.
 */
export function buildTemplateSkin(analysis: SceneAnalysis): TemplateSkin {
  const objects = normalizeObjects(analysis);
  const byAreaDesc = [...objects].sort((a, b) => area(b) - area(a));

  const machines = objects
    .filter((object) => matchesAny(object.label, MACHINE_WORDS))
    .sort((a, b) => b.confidence * area(b) - a.confidence * area(a));
  const star = machines[0] ?? byAreaDesc[0];
  const starLabel = star?.label ?? "arcade machine";
  const starComponentId =
    objectComponentIdFor(starLabel, "hazard", "spike-strip") ?? "enemy-turret";

  const smallProps = objects
    .filter(
      (object) => object !== star && matchesAny(object.label, AMMO_WORDS),
    )
    .sort((a, b) => area(a) - area(b));
  const ammoLabel = smallProps[0]?.label ?? fallbackAmmoLabel(starLabel);
  const ammoComponentIds = unique(
    [ammoLabel, smallProps[1]?.label]
      .filter((label): label is string => Boolean(label))
      .map((label) => objectComponentIdFor(label, "collectible", "gem"))
      .filter((id): id is string => Boolean(id)),
  );
  if (ammoComponentIds.length === 0) ammoComponentIds.push("food-donut");

  const fallerLabels = unique(
    [starLabel, ...byAreaDesc.map((object) => object.label)],
  ).slice(0, 3);
  const fallerComponentIds = unique(
    fallerLabels
      .map((label) => objectComponentIdFor(label, "collectible", "gem"))
      .filter((id): id is string => Boolean(id)),
  );
  const fallerLabel = fallerLabels[0] ?? "objects";

  const platformish = objects.filter((object) =>
    ["platform", "bridge", "vertical_platform", "moving_platform"].includes(
      object.role,
    ),
  );
  const platformLabels = unique(
    (platformish.length > 0 ? platformish : byAreaDesc).map(
      (object) => object.label,
    ),
  );
  if (platformLabels.length === 0) platformLabels.push("book", "box");

  const collectibleLabels = unique(
    objects
      .filter(
        (object) =>
          object.role === "collectible" ||
          matchesAny(object.label, AMMO_WORDS),
      )
      .sort((a, b) => area(a) - area(b))
      .map((object) => object.label),
  );
  if (collectibleLabels.length === 0) {
    collectibleLabels.push("coin", "donut", "gem");
  }

  const targetSprites = objects
    .map((object) => ({
      label: object.label,
      componentId: objectComponentIdFor(object.label, "collectible", "gem"),
    }))
    .filter(
      (entry): entry is { label: string; componentId: string } =>
        Boolean(entry.componentId),
    );

  return {
    starLabel,
    starComponentId,
    ammoLabel,
    ammoComponentIds,
    targetSprites,
    fallerLabel,
    fallerComponentIds,
    platformLabels,
    collectibleLabels,
    objectLabels: objects.map((object) => object.label),
    detectedObjectCount: objects.length,
  };
}
