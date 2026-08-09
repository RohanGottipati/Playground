import type { DetectedObject, SceneAnalysis } from "@/lib/backboard/schemas";

/**
 * Shorthand for the AI "player photo" scene analyses generated for each level.
 * Labels resolve to visual components so every slot renders rich visual art.
 */
export type SceneObjectInput = {
  label: string;
  /** Normalized photo bounds: [x, y, width, height], each 0..1. */
  at: [number, number, number, number];
  props: DetectedObject["properties"];
  role: DetectedObject["suggestedRole"];
  why: string;
  confidence?: number;
};

export function defineScene(input: {
  idPrefix: string;
  sceneType: SceneAnalysis["sceneType"];
  title: string;
  theme: SceneAnalysis["themeSuggestion"];
  objects: SceneObjectInput[];
}): SceneAnalysis {
  return {
    sceneType: input.sceneType,
    orientation: "landscape",
    titleSuggestion: input.title,
    themeSuggestion: input.theme,
    warnings: [],
    objects: input.objects.map((object, index) => ({
      id: `${input.idPrefix}-${object.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}`,
      label: object.label,
      confidence:
        object.confidence ?? Math.round((96 - index * 2)) / 100,
      bounds: {
        x: object.at[0],
        y: object.at[1],
        width: object.at[2],
        height: object.at[3],
      },
      properties: object.props,
      suggestedRole: object.role,
      reasoning: object.why,
    })),
  };
}
