import { describe, expect, it } from "vitest";
import { extractJsonObject, parseSceneAnalysis } from "@/lib/backboard/parseResponse";
import { deskScene } from "./fixtures/scenes";

describe("extractJsonObject", () => {
  it("strips markdown fences and prose", () => {
    const raw = `Sure!\n\`\`\`json\n{"a":1}\n\`\`\`\nHope that helps.`;
    expect(extractJsonObject(raw)).toBe('{"a":1}');
  });

  it("ignores braces inside strings", () => {
    expect(extractJsonObject('{"label":"cup {weird}"}')).toBe(
      '{"label":"cup {weird}"}',
    );
  });

  it("returns undefined when there is no object", () => {
    expect(extractJsonObject("no json here")).toBeUndefined();
  });
});

describe("parseSceneAnalysis", () => {
  it("parses a valid payload", () => {
    const result = parseSceneAnalysis(JSON.stringify(deskScene));
    expect(result.ok).toBe(true);
  });

  it("reports validation errors instead of throwing", () => {
    const result = parseSceneAnalysis('{"schemaVersion":"1"}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.length).toBeGreaterThan(0);
  });

  it("never throws on garbage", () => {
    expect(() => parseSceneAnalysis("<<<>>>")).not.toThrow();
  });
});
