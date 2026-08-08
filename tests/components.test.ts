import { describe, expect, it } from "vitest";
import {
  COMPONENT_CATALOG,
  COMPONENT_CATALOG_COUNTS,
  getComponentById,
  queryComponentCatalog,
} from "@/game/components/catalog";
import { selectComponentForEntity } from "@/game/components/selectComponent";
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

  it("keeps UI and unimplemented mechanics out of entity queries", () => {
    expect(getComponentById("hud-game")?.runtimeScope).toBe("ui");
    expect(getComponentById("enemy-slime")?.runtimeScope).toBe("future");
    expect(getComponentById("fur-mirror")?.runtimeScope).toBe("future");
    expect(
      queryComponentCatalog({ runtimeScope: "entity" }).every(
        (entry) => entry.mechanic,
      ),
    ).toBe(true);
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
    expect(
      selectComponentForEntity(entity("mirror", "collectible"), "gem").id,
    ).toBe("collectible-gem");
  });
});
