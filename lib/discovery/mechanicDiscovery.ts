import type { MechanicType } from "@/game/types";
import type { DetectedObject } from "@/lib/backboard/schemas";
import { normalizeObjectLabel } from "@/lib/utils/sanitize";

/** Controlled discovery vocabulary. New mechanics are never invented by the AI. */
export const DISCOVERY_RULES: { keywords: string[]; discovery: string }[] = [
  { keywords: ["umbrella", "parachute", "canopy", "fabric"], discovery: "gliding" },
  { keywords: ["spring", "sponge", "cushion", "ball"], discovery: "bouncing" },
  { keywords: ["magnet"], discovery: "magnetism" },
  { keywords: ["flashlight", "lamp", "torch", "candle"], discovery: "lighting" },
  { keywords: ["fan", "blower"], discovery: "wind" },
  { keywords: ["rubber band", "elastic", "sling"], discovery: "slingshot" },
  { keywords: ["cup", "mug", "ring", "roll", "tube"], discovery: "portal" },
  { keywords: ["cable", "rope", "wire", "cord", "charger"], discovery: "moving rail" },
];

const MECHANIC_DISCOVERY: Record<MechanicType, string> = {
  static_platform: "platforming",
  moving_platform: "moving rail",
  bounce_pad: "bouncing",
  hazard: "hazard",
  collectible: "collecting",
  portal: "portal",
  target: "sharpshooting",
  goal: "goal",
};

export type DiscoveryPair = { label: string; mechanic: string };

export function discoveryForObject(
  label: string,
  mechanic: MechanicType,
): string {
  const normalized = normalizeObjectLabel(label);
  const rule = DISCOVERY_RULES.find((candidate) =>
    candidate.keywords.some((keyword) => normalized.includes(keyword)),
  );
  return rule?.discovery ?? MECHANIC_DISCOVERY[mechanic];
}

export function discoveryPairs(
  objects: DetectedObject[],
  mechanicByObjectId: Map<string, MechanicType>,
): DiscoveryPair[] {
  const pairs = new Map<string, DiscoveryPair>();
  for (const object of objects) {
    const mechanic = mechanicByObjectId.get(object.id);
    if (!mechanic) continue;
    const discovery = discoveryForObject(object.label, mechanic);
    const key = `${normalizeObjectLabel(object.label)}|${discovery}`;
    if (!pairs.has(key)) {
      pairs.set(key, { label: object.label, mechanic: discovery });
    }
  }
  return [...pairs.values()];
}
