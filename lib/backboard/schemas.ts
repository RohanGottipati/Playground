import { z } from "zod";

export const PhysicalPropertySchema = z.enum([
  "large",
  "small",
  "flat",
  "tall",
  "round",
  "long",
  "thin",
  "sharp",
  "soft",
  "rigid",
  "flexible",
  "hollow",
  "reflective",
  "electronic",
  "rollable",
  "springy",
  "container",
  "unknown",
]);

export const SuggestedRoleSchema = z.enum([
  "platform",
  "bridge",
  "vertical_platform",
  "moving_platform",
  "bounce_pad",
  "hazard",
  "collectible",
  "portal",
  "goal_landmark",
  "decoration",
]);

export const DetectedObjectSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  confidence: z.number().min(0).max(1),
  bounds: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().gt(0).max(1),
    height: z.number().gt(0).max(1),
  }),
  properties: z.array(PhysicalPropertySchema).min(1).max(8),
  suggestedRole: SuggestedRoleSchema,
  reasoning: z.string().max(180),
});

export const SceneAnalysisSchema = z.object({
  sceneType: z.enum([
    "desk",
    "table",
    "floor",
    "counter",
    "drawing",
    "mixed",
    "unknown",
  ]),
  orientation: z.enum(["landscape", "portrait", "square"]),
  titleSuggestion: z.string().min(1).max(60),
  themeSuggestion: z.enum([
    "arcade",
    "space",
    "forest",
    "factory",
    "neon",
    "paper",
    "kitchen",
    "default",
  ]),
  objects: z.array(DetectedObjectSchema).min(1).max(15),
  warnings: z.array(z.string()).max(6),
});

export type PhysicalProperty = z.infer<typeof PhysicalPropertySchema>;
export type SuggestedRole = z.infer<typeof SuggestedRoleSchema>;
export type DetectedObject = z.infer<typeof DetectedObjectSchema>;
export type SceneAnalysis = z.infer<typeof SceneAnalysisSchema>;

export const AI_SCHEMA_VERSION = "1";
