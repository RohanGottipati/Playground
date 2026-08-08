import type { SceneAnalysis } from "./schemas";

export type FallbackInput = {
  /** Any stable string (game id, file name) so the fallback stays deterministic. */
  seed: string;
  orientation?: SceneAnalysis["orientation"];
};

function hash(seed: string): number {
  let value = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
}

const TITLES = [
  "Desk Escape",
  "Tabletop Trials",
  "Object Run",
  "Counter Climb",
  "Surface Sprint",
];

/**
 * Deterministic, always-playable scene used when the vision model cannot
 * produce a valid analysis. The user is told the level was simplified.
 */
export function buildFallbackAnalysis(input: FallbackInput): SceneAnalysis {
  const seed = hash(input.seed);
  const lift = ((seed % 5) - 2) * 0.03;

  return {
    sceneType: "unknown",
    orientation: input.orientation ?? "landscape",
    titleSuggestion: TITLES[seed % TITLES.length],
    themeSuggestion: "arcade",
    objects: [
      {
        id: "fallback-1",
        label: "flat block",
        confidence: 0.4,
        bounds: { x: 0.18, y: 0.62 + lift, width: 0.16, height: 0.06 },
        properties: ["flat", "rigid"],
        suggestedRole: "platform",
        reasoning: "Deterministic fallback platform",
      },
      {
        id: "fallback-2",
        label: "tall container",
        confidence: 0.4,
        bounds: { x: 0.4, y: 0.46 + lift, width: 0.1, height: 0.18 },
        properties: ["tall", "container"],
        suggestedRole: "vertical_platform",
        reasoning: "Deterministic fallback tower",
      },
      {
        id: "fallback-3",
        label: "long thin object",
        confidence: 0.4,
        bounds: { x: 0.56, y: 0.4 + lift, width: 0.14, height: 0.03 },
        properties: ["long", "thin"],
        suggestedRole: "bridge",
        reasoning: "Deterministic fallback bridge",
      },
      {
        id: "fallback-4",
        label: "small trinket",
        confidence: 0.4,
        bounds: { x: 0.47, y: 0.34 + lift, width: 0.04, height: 0.04 },
        properties: ["small"],
        suggestedRole: "collectible",
        reasoning: "Deterministic fallback collectible",
      },
      {
        id: "fallback-5",
        label: "wide shelf",
        confidence: 0.4,
        bounds: { x: 0.76, y: 0.34 + lift, width: 0.18, height: 0.05 },
        properties: ["flat", "large"],
        suggestedRole: "goal_landmark",
        reasoning: "Deterministic fallback goal platform",
      },
    ],
    warnings: ["Analysis was simplified because the photo could not be analyzed."],
  };
}
