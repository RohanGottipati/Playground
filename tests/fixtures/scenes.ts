import type { SceneAnalysis } from "@/lib/backboard/schemas";

/** A well-spaced desk scene: platforms, a bounce pad, a hazard, a collectible. */
export const deskScene: SceneAnalysis = {
  sceneType: "desk",
  orientation: "landscape",
  titleSuggestion: "Desk Dash",
  themeSuggestion: "arcade",
  warnings: [],
  objects: [
    {
      id: "o1",
      label: "notebook",
      properties: ["flat", "rigid"],
      suggestedRole: "platform",
      confidence: 0.9,
      bounds: { x: 0.12, y: 0.62, width: 0.16, height: 0.05 },
      reasoning: "flat rectangle lying down",
    },
    {
      id: "o2",
      label: "mug",
      properties: ["round", "hollow"],
      suggestedRole: "bounce_pad",
      confidence: 0.8,
      bounds: { x: 0.34, y: 0.66, width: 0.09, height: 0.09 },
      reasoning: "round hollow object",
    },
    {
      id: "o3",
      label: "pencil",
      properties: ["long", "thin"],
      suggestedRole: "platform",
      confidence: 0.75,
      bounds: { x: 0.5, y: 0.5, width: 0.18, height: 0.03 },
      reasoning: "long thin bar",
    },
    {
      id: "o4",
      label: "scissors",
      properties: ["sharp", "rigid"],
      suggestedRole: "hazard",
      confidence: 0.7,
      bounds: { x: 0.7, y: 0.7, width: 0.08, height: 0.04 },
      reasoning: "sharp blades",
    },
    {
      id: "o5",
      label: "eraser",
      properties: ["small", "soft"],
      suggestedRole: "collectible",
      confidence: 0.65,
      bounds: { x: 0.8, y: 0.4, width: 0.04, height: 0.04 },
      reasoning: "small pickup-sized object",
    },
  ],
};

/** Objects piled in one corner: exercises clamping, dedupe and repair. */
export const clutteredScene: SceneAnalysis = {
  sceneType: "table",
  orientation: "landscape",
  titleSuggestion: "Cluttered Corner",
  themeSuggestion: "kitchen",
  warnings: ["objects overlap"],
  objects: [
    {
      id: "c1",
      label: "plate",
      properties: ["flat", "round"],
      suggestedRole: "platform",
      confidence: 0.9,
      bounds: { x: 0.02, y: 0.05, width: 0.1, height: 0.04 },
      reasoning: "flat disc",
    },
    {
      id: "c2",
      label: "plate",
      properties: ["flat", "round"],
      suggestedRole: "platform",
      confidence: 0.6,
      bounds: { x: 0.03, y: 0.06, width: 0.1, height: 0.04 },
      reasoning: "duplicate detection of the same plate",
    },
    {
      id: "c3",
      label: "fork",
      properties: ["sharp", "thin"],
      suggestedRole: "hazard",
      confidence: 0.8,
      bounds: { x: 0.9, y: 0.9, width: 0.2, height: 0.2 },
      reasoning: "sharp tines, extends past the frame",
    },
    {
      id: "c4",
      label: "bowl",
      properties: ["round", "container"],
      suggestedRole: "portal",
      confidence: 0.5,
      bounds: { x: 0.55, y: 0.2, width: 0.06, height: 0.06 },
      reasoning: "round container",
    },
  ],
};
