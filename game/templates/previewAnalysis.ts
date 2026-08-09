import type { SceneAnalysis } from "@/lib/backboard/schemas";

/**
 * Showcase analysis used to seed the arcade preview games: a kitchen-counter
 * scene whose labels all resolve to exact bundled object sprites, so every
 * template slot renders real Magic Patterns art.
 */
export const PREVIEW_ANALYSIS: SceneAnalysis = {
  sceneType: "counter",
  orientation: "landscape",
  titleSuggestion: "Counter Culture",
  themeSuggestion: "kitchen",
  warnings: [],
  objects: [
    {
      id: "preview-fridge",
      label: "fridge",
      confidence: 0.97,
      bounds: { x: 0.72, y: 0.18, width: 0.24, height: 0.66 },
      properties: ["large", "tall", "rigid"],
      suggestedRole: "platform",
      reasoning: "Tall boxy appliance dominating the right of the frame.",
    },
    {
      id: "preview-soda-can",
      label: "soda can",
      confidence: 0.94,
      bounds: { x: 0.58, y: 0.62, width: 0.05, height: 0.1 },
      properties: ["small", "round", "rollable"],
      suggestedRole: "collectible",
      reasoning: "Small cylindrical can on the counter.",
    },
    {
      id: "preview-donut",
      label: "donut",
      confidence: 0.93,
      bounds: { x: 0.47, y: 0.66, width: 0.06, height: 0.07 },
      properties: ["small", "round", "soft"],
      suggestedRole: "collectible",
      reasoning: "Ring-shaped pastry on a plate.",
    },
    {
      id: "preview-notebook",
      label: "notebook",
      confidence: 0.9,
      bounds: { x: 0.08, y: 0.7, width: 0.18, height: 0.09 },
      properties: ["flat", "rigid"],
      suggestedRole: "platform",
      reasoning: "Flat notebook lying near the left edge.",
    },
    {
      id: "preview-book",
      label: "book",
      confidence: 0.88,
      bounds: { x: 0.3, y: 0.68, width: 0.15, height: 0.1 },
      properties: ["flat", "rigid"],
      suggestedRole: "platform",
      reasoning: "Hardcover book stacked mid-counter.",
    },
    {
      id: "preview-mug",
      label: "mug",
      confidence: 0.9,
      bounds: { x: 0.2, y: 0.58, width: 0.07, height: 0.1 },
      properties: ["small", "hollow", "container"],
      suggestedRole: "bounce_pad",
      reasoning: "Ceramic mug beside the notebook.",
    },
    {
      id: "preview-scissors",
      label: "scissors",
      confidence: 0.86,
      bounds: { x: 0.53, y: 0.74, width: 0.09, height: 0.06 },
      properties: ["sharp", "rigid"],
      suggestedRole: "hazard",
      reasoning: "Open scissors pointing across the counter.",
    },
  ],
};
