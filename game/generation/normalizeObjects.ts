import {
  MAX_DETECTED_OBJECTS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "@/game/constants";
import type {
  DetectedObject,
  PhysicalProperty,
  SceneAnalysis,
  SuggestedRole,
} from "@/lib/backboard/schemas";
import type { Rect } from "@/game/types";

export type NormalizedObject = {
  id: string;
  label: string;
  confidence: number;
  properties: PhysicalProperty[];
  role: SuggestedRole;
  /** World-space rect, already clamped to the world bounds. */
  bounds: Rect;
  /** Raw normalized (0..1) bounds, preserved for storage and art cutouts. */
  normalizedBounds: Rect;
};

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function toWorldRect(bounds: Rect): Rect {
  const x = clamp(bounds.x, 0, 1) * WORLD_WIDTH;
  const y = clamp(bounds.y, 0, 1) * WORLD_HEIGHT;
  const width = clamp(bounds.width, 0.001, 1) * WORLD_WIDTH;
  const height = clamp(bounds.height, 0.001, 1) * WORLD_HEIGHT;
  const left = clamp(x, 0, WORLD_WIDTH - 1);
  const top = clamp(y, 0, WORLD_HEIGHT - 1);
  return {
    x: left,
    y: top,
    width: clamp(width, 1, WORLD_WIDTH - left),
    height: clamp(height, 1, WORLD_HEIGHT - top),
  };
}

export function intersectionOverUnion(a: Rect, b: Rect): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  const overlap = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  if (overlap <= 0) return 0;
  const union = a.width * a.height + b.width * b.height - overlap;
  return union <= 0 ? 0 : overlap / union;
}

const DEDUPE_IOU = 0.4;

/**
 * Converts validated AI objects into deterministic world-space objects:
 * clamps coordinates, removes duplicates, and orders them left to right.
 */
export function normalizeObjects(analysis: SceneAnalysis): NormalizedObject[] {
  const sorted = [...analysis.objects].sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return a.id.localeCompare(b.id);
  });

  const kept: NormalizedObject[] = [];
  const seenIds = new Set<string>();

  for (const object of sorted) {
    if (kept.length >= MAX_DETECTED_OBJECTS) break;
    const id = uniqueId(object, seenIds);
    const normalizedBounds: Rect = {
      x: clamp(object.bounds.x, 0, 1),
      y: clamp(object.bounds.y, 0, 1),
      width: clamp(object.bounds.width, 0.001, 1),
      height: clamp(object.bounds.height, 0.001, 1),
    };
    const bounds = toWorldRect(normalizedBounds);
    const duplicate = kept.some(
      (existing) =>
        existing.label.toLowerCase() === object.label.toLowerCase() &&
        intersectionOverUnion(existing.bounds, bounds) > DEDUPE_IOU,
    );
    if (duplicate) continue;

    kept.push({
      id,
      label: object.label.trim().slice(0, 80),
      confidence: clamp(object.confidence, 0, 1),
      properties: dedupeProperties(object.properties),
      role: object.suggestedRole,
      bounds,
      normalizedBounds,
    });
  }

  return kept.sort((a, b) => a.bounds.x - b.bounds.x);
}

function uniqueId(object: DetectedObject, seen: Set<string>): string {
  const base = object.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "obj";
  let candidate = base;
  let counter = 2;
  while (seen.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  seen.add(candidate);
  return candidate;
}

function dedupeProperties(properties: PhysicalProperty[]): PhysicalProperty[] {
  return Array.from(new Set(properties)).slice(0, 8);
}
