import { describe, expect, it } from "vitest";
import { SceneAnalysisSchema } from "@/lib/backboard/schemas";
import { deskScene } from "./fixtures/scenes";

describe("SceneAnalysisSchema", () => {
  it("accepts a valid scene", () => {
    expect(SceneAnalysisSchema.safeParse(deskScene).success).toBe(true);
  });

  it("rejects unknown roles", () => {
    const invalid = {
      ...deskScene,
      objects: [{ ...deskScene.objects[0], suggestedRole: "teleport_cannon" }],
    };
    expect(SceneAnalysisSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects out-of-range coordinates", () => {
    const invalid = {
      ...deskScene,
      objects: [
        {
          ...deskScene.objects[0],
          bounds: { x: -0.4, y: 0.2, width: 0.2, height: 0.2 },
        },
      ],
    };
    expect(SceneAnalysisSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects scenes with too few objects", () => {
    const invalid = { ...deskScene, objects: [], objectCount: 0 };
    expect(SceneAnalysisSchema.safeParse(invalid).success).toBe(false);
  });

  it("accepts one clearly visible object", () => {
    const singleObject = { ...deskScene, objects: [deskScene.objects[0]] };
    expect(SceneAnalysisSchema.safeParse(singleObject).success).toBe(true);
  });
});
