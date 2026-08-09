import { describe, expect, it } from "vitest";
import { getComponentById } from "@/game/components/catalog";
import { collectSafetyIssues, isSpecSafe } from "@/game/generation/runtimeSafety";
import { winConditionFor } from "@/game/generation/winCondition";
import {
  computeReachability,
  GROUND_NODE_ID,
} from "@/game/generation/validateReachability";
import {
  buildTemplateSpec,
  templateForSeed,
  TEMPLATE_IDS,
  TEMPLATES,
  type TemplateId,
} from "@/game/templates";
import { PREVIEW_ANALYSIS } from "@/game/templates/previewAnalysis";
import { objectComponentIdFor } from "@/game/templates/skin";
import { renderMagicPatternSvg } from "@/magic-patterns/render";
import type { GameSpec } from "@/game/types";
import { deskScene } from "./fixtures/scenes";

function build(template: TemplateId, seed = 7): GameSpec {
  return buildTemplateSpec(PREVIEW_ANALYSIS, seed, {
    imageUrl: "https://example.test/preview.jpg",
    forceTemplate: template,
  });
}

describe("template selection", () => {
  it("is a seeded pick that eventually covers every template", () => {
    const seen = new Set<TemplateId>();
    for (let seed = 1; seed <= 4096; seed += 1) {
      seen.add(templateForSeed(seed));
    }
    expect([...seen].sort()).toEqual([...TEMPLATE_IDS].sort());
  });

  it("is deterministic per seed", () => {
    for (let seed = 1; seed <= 64; seed += 1) {
      expect(templateForSeed(seed)).toBe(templateForSeed(seed));
    }
  });

  it("weights casual uploads toward gentler layouts", () => {
    let gentle = 0;
    let brutal = 0;
    for (let seed = 1; seed <= 4096; seed += 1) {
      const difficulty = TEMPLATES[templateForSeed(seed)].difficulty;
      if (difficulty <= 3) gentle += 1;
      if (difficulty >= 4) brutal += 1;
    }
    expect(gentle).toBeGreaterThan(brutal);
  });
});

describe("campaign roster", () => {
  it("holds 23 games ordered from gentlest to most brutal", () => {
    expect(TEMPLATE_IDS).toHaveLength(23);
    const difficulties = TEMPLATE_IDS.map((id) => TEMPLATES[id].difficulty);
    for (let i = 1; i < difficulties.length; i += 1) {
      expect(difficulties[i], TEMPLATE_IDS[i]).toBeGreaterThanOrEqual(
        difficulties[i - 1],
      );
    }
    expect(difficulties[0]).toBe(1);
    expect(difficulties[difficulties.length - 1]).toBe(5);
  });

  it("covers every mode at a range of difficulties", () => {
    const modes = new Set(TEMPLATE_IDS.map((id) => TEMPLATES[id].mode));
    expect([...modes].sort()).toEqual([
      "classic",
      "gauntlet",
      "rush",
      "shooter",
      "skyfall",
    ]);
  });

  it("declares the difficulty and mode each spec actually builds", () => {
    for (const template of TEMPLATE_IDS) {
      const spec = build(template);
      expect(spec.difficulty, template).toBe(TEMPLATES[template].difficulty);
      expect(spec.mode, template).toBe(TEMPLATES[template].mode);
    }
  });

  it("builds a safe game from each template's own simulated photo", () => {
    for (const template of TEMPLATE_IDS) {
      const spec = buildTemplateSpec(TEMPLATES[template].previewAnalysis, 31, {
        imageUrl: `/template-previews/${template}.svg`,
        forceTemplate: template,
      });
      expect(isSpecSafe(spec), `${template}: ${collectSafetyIssues(spec).join("; ")}`).toBe(true);
      expect(winConditionFor(spec), template).toBeDefined();
    }
  });

  it("simulates photos whose objects all resolve to real sprite art", () => {
    for (const template of TEMPLATE_IDS) {
      for (const object of TEMPLATES[template].previewAnalysis.objects) {
        const componentId = objectComponentIdFor(
          object.label,
          "collectible",
          "gem",
        );
        expect(componentId, `${template}: ${object.label}`).toBeDefined();
        expect(
          getComponentById(componentId)?.metadata.componentType,
          `${template}: ${object.label}`,
        ).toBe("object-sprite");
      }
    }
  });
});

describe.each(TEMPLATE_IDS)("%s template", (template) => {
  it("builds a safe, deterministic spec from any analysis", () => {
    for (const analysis of [PREVIEW_ANALYSIS, deskScene]) {
      for (const seed of [1, 99, 4242]) {
        const spec = buildTemplateSpec(analysis, seed, {
          imageUrl: "https://example.test/any.jpg",
          forceTemplate: template,
        });
        expect(isSpecSafe(spec), collectSafetyIssues(spec).join("; ")).toBe(true);
        expect(spec.validation.pipelineVersion).toBe(2);
        expect(spec.rules).toBeDefined();
        const again = buildTemplateSpec(analysis, seed, {
          imageUrl: "https://example.test/any.jpg",
          forceTemplate: template,
        });
        expect(JSON.stringify(again)).toBe(JSON.stringify(spec));
      }
    }
  });

  it("resolves every entity visual to a bundled component", () => {
    const spec = build(template);
    for (const entity of spec.entities) {
      expect(entity.visual?.componentId, entity.id).toBeDefined();
      expect(getComponentById(entity.visual?.componentId), entity.id).toBeDefined();
    }
  });
});

describe("gauntlet template", () => {
  const spec = build("gauntlet");

  it("wins by reaching the finish beside the machine", () => {
    expect(spec.mode).toBe("gauntlet");
    expect(winConditionFor(spec)).toBe("door");
    const goal = spec.entities.find((entity) => entity.mechanic === "goal");
    const turret = spec.entities.find(
      (entity) => entity.id === spec.gauntlet?.turretId,
    );
    expect(goal).toBeDefined();
    expect(turret?.mechanic).toBe("hazard");
    // The finish sits in front of the machine, at the far right of the run.
    expect(goal!.bounds.x).toBeGreaterThan(1300);
    expect(goal!.bounds.x + goal!.bounds.width).toBeLessThanOrEqual(
      turret!.bounds.x,
    );
    const reachability = computeReachability(spec.entities);
    expect(reachability.reachable.has(GROUND_NODE_ID)).toBe(true);
  });

  it("skins the turret with the photographed machine", () => {
    const turret = spec.entities.find(
      (entity) => entity.id === spec.gauntlet?.turretId,
    );
    // The preview scene's star machine is a fridge with exact object art.
    expect(turret?.visual?.componentId).toBe("kit-fridge");
    expect(spec.gauntlet?.ammoComponentIds.length).toBeGreaterThan(0);
    for (const id of spec.gauntlet?.ammoComponentIds ?? []) {
      expect(getComponentById(id)?.metadata.componentType).toBe("object-sprite");
    }
  });

  it("falls back to the Magic Patterns turret when nothing machine-like exists", () => {
    const noMachine = {
      ...deskScene,
      objects: deskScene.objects.filter(
        (object) => !/keyboard|monitor|laptop/i.test(object.label),
      ),
    };
    const spec2 = buildTemplateSpec(noMachine, 3, {
      imageUrl: "https://example.test/desk.jpg",
      forceTemplate: "gauntlet",
    });
    const turret = spec2.entities.find(
      (entity) => entity.id === spec2.gauntlet?.turretId,
    );
    expect(turret?.visual?.componentId).toBeDefined();
    const entry = getComponentById(turret?.visual?.componentId);
    expect(
      entry?.metadata.componentType === "object-sprite" ||
        entry?.id === "enemy-turret",
    ).toBe(true);
  });
});

describe("dodge template", () => {
  const spec = build("dodge");

  it("wins by the dodge counter, with no door anywhere", () => {
    expect(spec.mode).toBe("skyfall");
    expect(winConditionFor(spec)).toBe("dodge");
    expect(spec.skyfall?.dodgeCount).toBeGreaterThanOrEqual(5);
    expect(
      spec.entities.filter((entity) => entity.mechanic === "goal"),
    ).toHaveLength(0);
  });

  it("rains exact object sprites from the photo", () => {
    expect(spec.skyfall?.componentIds.length).toBeGreaterThan(0);
    for (const id of spec.skyfall?.componentIds ?? []) {
      expect(getComponentById(id)?.metadata.componentType).toBe("object-sprite");
    }
  });
});

describe("quest template", () => {
  const spec = build("quest");

  it("is the one and only door game", () => {
    expect(spec.mode).toBe("classic");
    expect(winConditionFor(spec)).toBe("door");
    const goals = spec.entities.filter((entity) => entity.mechanic === "goal");
    expect(goals).toHaveLength(1);
    expect(goals[0].visual?.componentId).toBe("mechanic-exit-door");
  });
});

describe("core Magic Patterns sprites", () => {
  it.each(["enemy-turret", "mechanic-exit-door", "decor-finish-flag"])(
    "renders %s as real SVG art",
    (componentId) => {
      const svg = renderMagicPatternSvg(componentId);
      expect(svg).toMatch(/^<svg\b/);
      expect(svg).toContain("</svg>");
    },
  );
});
