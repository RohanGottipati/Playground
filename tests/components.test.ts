import { describe, expect, it } from "vitest";
import {
  COMPONENT_CATALOG,
  COMPONENT_CATALOG_COUNTS,
  getComponentById,
  queryComponentCatalog,
} from "@/game/components/catalog";
import { selectComponentForEntity } from "@/game/components/selectComponent";
import {
  MAGIC_PATTERN_COMPONENT_IDS,
  magicPatternSvgDataUri,
  renderMagicPatternSvg,
} from "@/magic-patterns/registry";
import type {
  EntityVisualKind,
  GameEntitySpec,
  MechanicType,
} from "@/game/types";

function entity(
  sourceLabel: string,
  mechanic: MechanicType,
): GameEntitySpec {
  return {
    id: `test-${sourceLabel}`,
    sourceLabel,
    mechanic,
    bounds: { x: 0, y: 0, width: 100, height: 30 },
  };
}

describe("component catalog", () => {
  it("registers every supplied core and everyday-object component", () => {
    expect(COMPONENT_CATALOG_COUNTS).toEqual({
      core: 138,
      objects: 211,
      total: 349,
    });
    expect(COMPONENT_CATALOG).toHaveLength(349);
    expect(new Set(COMPONENT_CATALOG.map((entry) => entry.id)).size).toBe(349);
  });

  it("contains all supplied component categories", () => {
    const categories = new Set(COMPONENT_CATALOG.map((entry) => entry.category));
    for (const category of [
      "characters", "enemies", "terrain", "hazards", "mechanics",
      "collectibles", "decor", "hud", "controls", "panels", "overlays",
      "furniture", "kitchen", "food", "tech", "stationery", "sports",
      "vehicles", "tools", "clothing", "outdoors", "toys", "music",
      "household",
    ]) {
      expect(categories.has(category), category).toBe(true);
    }
  });

  it("keeps UI and enemies out of entity rendering", () => {
    expect(getComponentById("hud-game")?.runtimeScope).toBe("ui");
    expect(getComponentById("enemy-slime")?.runtimeScope).toBe("future");
    expect(getComponentById("fur-mirror")?.runtimeScope).toBe("entity");
    expect(
      queryComponentCatalog({ runtimeScope: "entity" }).every(
        (entry) => entry.rendererKey,
      ),
    ).toBe(true);
  });

  it("maps every database object ID to one unique Magic Patterns component", () => {
    const databaseObjectIds = COMPONENT_CATALOG
      .filter((entry) => entry.metadata.componentType === "object-sprite")
      .map((entry) => entry.id)
      .sort();
    expect(MAGIC_PATTERN_COMPONENT_IDS).toHaveLength(211);
    expect(new Set(MAGIC_PATTERN_COMPONENT_IDS).size).toBe(211);
    expect([...MAGIC_PATTERN_COMPONENT_IDS].sort()).toEqual(databaseObjectIds);
  });

  it.each([
    ["fur-sofa", "#0d9488"],
    ["kit-kettle", "#94a3b8"],
    ["food-donut", "#f472b6"],
  ])("renders the real %s React component as SVG", (componentId, fill) => {
    const svg = renderMagicPatternSvg(componentId);
    expect(svg).toMatch(/^<svg\b/);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain(fill);
    expect(svg).toContain("</svg>");
    const dataUri = magicPatternSvgDataUri(componentId);
    expect(dataUri).toMatch(/^data:image\/svg\+xml;base64,/);
    // Phaser decodes data URIs with atob, so the payload must round-trip.
    const base64 = dataUri!.slice("data:image/svg+xml;base64,".length);
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)),
    );
    expect(decoded).toBe(svg);
  });
});

describe("database component selection", () => {
  const cases: [string, MechanicType, EntityVisualKind, string][] = [
    ["sofa", "static_platform", "book-platform", "fur-sofa"],
    ["kettle", "hazard", "spike-strip", "kit-kettle"],
    ["donut", "collectible", "gem", "food-donut"],
    ["keyboard", "static_platform", "book-platform", "tech-keyboard"],
    ["yellow pencil", "static_platform", "pencil-bridge", "stat-pencil"],
    ["basketball", "bounce_pad", "trampoline", "sport-basketball"],
    ["car", "moving_platform", "moving-platform", "veh-car"],
    ["nail", "hazard", "spike-strip", "tool-nail"],
    ["t-shirt", "collectible", "gem", "cloth-t-shirt"],
    ["cactus", "hazard", "spike-strip", "out-cactus"],
    ["toy car", "moving_platform", "moving-platform", "toy-toy-car"],
    ["drum", "bounce_pad", "bounce-pad", "mus-drum"],
    ["birthday cake", "collectible", "gem", "house-birthday-cake"],
  ];

  it.each(cases)(
    "maps %s to its applicable registered component",
    (label, mechanic, kind, expectedId) => {
      expect(selectComponentForEntity(entity(label, mechanic), kind).id).toBe(
        expectedId,
      );
    },
  );

  it("uses a supported fallback for catalog-only entries", () => {
    expect(
      selectComponentForEntity(
        entity("slime enemy", "hazard"),
        "spike-strip",
      ).id,
    ).toBe("hazard-spike-strip");
  });

  it("selects exact object art even when its concept mechanic is not implemented", () => {
    expect(
      selectComponentForEntity(entity("mirror", "collectible"), "gem").id,
    ).toBe("fur-mirror");
    expect(
      selectComponentForEntity(entity("eraser", "collectible"), "eraser").id,
    ).toBe("stat-eraser");
  });
});
