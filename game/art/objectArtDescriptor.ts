import { COMPONENT_CATALOG } from "@/game/components/catalog";

export const OBJECT_ART_SHAPES = [
  "furniture",
  "container",
  "screen",
  "round",
  "long",
  "vehicle",
  "food",
  "wearable",
  "nature",
  "instrument",
  "tool",
  "toy",
  "object",
] as const;

export type ObjectArtShape = (typeof OBJECT_ART_SHAPES)[number];

export type ObjectArtDescriptor = {
  componentId: string;
  rendererKey: string;
  name: string;
  category: string;
  shape: ObjectArtShape;
  primary: number;
  secondary: number;
  monogram: string;
  variant: number;
  animated: boolean;
};

const CATEGORY_COLORS: Record<string, [number, number]> = {
  furniture: [0xa78bfa, 0x7c3aed],
  kitchen: [0xf97316, 0xfbbf24],
  food: [0xef4444, 0xfacc15],
  tech: [0x38bdf8, 0x2563eb],
  stationery: [0xfacc15, 0xf472b6],
  sports: [0x22c55e, 0x0ea5e9],
  vehicles: [0x3b82f6, 0xef4444],
  tools: [0x94a3b8, 0xf59e0b],
  clothing: [0xf472b6, 0xa855f7],
  outdoors: [0x4ade80, 0x16a34a],
  toys: [0xa855f7, 0xfacc15],
  music: [0xf59e0b, 0xdc2626],
  household: [0x14b8a6, 0x6366f1],
};

const ROUND_WORDS = [
  "ball", "donut", "plate", "vinyl", "tambourine", "globe", "clock",
  "marble", "roll", "ring", "apple", "watermelon", "frisbee", "tyre",
  "tire", "dice", "top", "balloon", "piggy",
];
const CONTAINER_WORDS = [
  "mug", "cup", "kettle", "pot", "bottle", "can", "bucket", "basket",
  "bin", "box", "bathtub", "wallet", "toolbox", "beehive", "nest",
];
const SCREEN_WORDS = [
  "laptop", "phone", "tablet", "television", "keyboard", "calculator",
  "camera", "router", "microwave", "washing machine", "whiteboard",
];
const VEHICLE_WORDS = [
  "car", "bus", "truck", "train", "aeroplane", "airplane", "plane",
  "rocket", "boat", "scooter", "motorcycle", "bicycle", "helicopter",
  "trolley", "cart", "wheelbarrow", "skateboard", "surfboard", "skate",
];
const LONG_WORDS = [
  "pencil", "pen", "ruler", "knife", "fork", "rolling pin", "bat",
  "stick", "racket", "rope", "ski", "saw", "brush", "broom", "shovel",
  "chain", "nail", "toothbrush", "scarf", "belt", "hanger", "guitar",
  "violin", "harmonica", "flashlight", "screwdriver", "wrench", "hammer",
];

function includesAny(name: string, words: readonly string[]): boolean {
  return words.some((word) => name.includes(word));
}

function shapeFor(name: string, category: string): ObjectArtShape {
  if (includesAny(name, ROUND_WORDS)) return "round";
  if (includesAny(name, VEHICLE_WORDS)) return "vehicle";
  if (includesAny(name, SCREEN_WORDS)) return "screen";
  if (includesAny(name, CONTAINER_WORDS)) return "container";
  if (includesAny(name, LONG_WORDS)) return "long";
  switch (category) {
    case "furniture": return "furniture";
    case "food": return "food";
    case "clothing": return "wearable";
    case "outdoors": return "nature";
    case "music": return "instrument";
    case "tools": return "tool";
    case "toys": return "toy";
    default: return "object";
  }
}

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function monogram(name: string): string {
  const words = name.toUpperCase().match(/[A-Z0-9]+/g) ?? [];
  const [first = "", second = ""] = words;
  if (!first) return "?";
  if (!second) return first.slice(0, 2);
  return `${first.charAt(0)}${second.charAt(0)}`;
}

const descriptors = new Map<string, ObjectArtDescriptor>();
for (const entry of COMPONENT_CATALOG) {
  if (entry.metadata.componentType !== "object-sprite" || !entry.rendererKey) {
    continue;
  }
  const colors = CATEGORY_COLORS[entry.category] ?? [0x94a3b8, 0x475569];
  descriptors.set(entry.id, {
    componentId: entry.id,
    rendererKey: entry.rendererKey,
    name: entry.name,
    category: entry.category,
    shape: shapeFor(entry.name.toLowerCase(), entry.category),
    primary: colors[0],
    secondary: colors[1],
    monogram: monogram(entry.name),
    variant: hash(entry.id) % 4,
    animated: entry.metadata.animated === true,
  });
}

export const EXACT_OBJECT_COMPONENT_IDS = Object.freeze([...descriptors.keys()]);

export function objectArtDescriptor(
  componentId: string | undefined,
): ObjectArtDescriptor | undefined {
  return componentId ? descriptors.get(componentId) : undefined;
}

export function hasExactObjectArt(componentId: string | undefined): boolean {
  return objectArtDescriptor(componentId) !== undefined;
}
