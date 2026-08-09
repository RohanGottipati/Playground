import { describe, expect, it } from "vitest";
import { getComponentById } from "@/game/components/catalog";
import {
  collectSafetyIssues,
  isSpecSafe,
} from "@/game/generation/runtimeSafety";
import {
  canJump,
  computeReachability,
  toPlatformNode,
} from "@/game/generation/validateReachability";
import { winConditionFor } from "@/game/generation/winCondition";
import {
  buildTemplateSpec,
  CAMPAIGN_TEMPLATE_IDS,
  recipeForAnalysis,
  templateForSeed,
  TEMPLATE_IDS,
  TEMPLATES,
} from "@/game/templates";
import {
  CASEBARRAGE_SCENE,
  PHONE_PAD_COUNT,
} from "@/game/templates/casebarrage";
import { detectsCaseBarrage } from "@/game/templates/detectTrio";
import { PREVIEW_ANALYSIS } from "@/game/templates/previewAnalysis";
import { randomizeShelters } from "@/game/templates/shelters";
import type { GameEntitySpec, GameSpec } from "@/game/types";
import { defineScene, type SceneObjectInput } from "@/game/templates/fixtures";
import { deskScene } from "./fixtures/scenes";

const IMAGE_URL = "https://example.test/trio.jpg";

/** A photo of exactly the labels given, at plausible desk positions. */
function photoOf(...labels: string[]) {
  return defineScene({
    idPrefix: "trio",
    sceneType: "table",
    title: "Desk Standoff",
    theme: "arcade",
    objects: labels.map((label, index): SceneObjectInput => ({
      label,
      at: [0.1 + index * 0.2, 0.5, 0.12, 0.16],
      props: ["small", "rigid"],
      role: "platform",
      why: `${label} on the table.`,
    })),
  });
}

function build(seed: number): GameSpec {
  return buildTemplateSpec(CASEBARRAGE_SCENE, seed, { imageUrl: IMAGE_URL });
}

function entitiesOf(spec: GameSpec, mechanic: string): GameEntitySpec[] {
  return spec.entities.filter((entity) => entity.mechanic === mechanic);
}

describe("trio detection", () => {
  it("fires on the template's own reference photo", () => {
    expect(detectsCaseBarrage(CASEBARRAGE_SCENE)).toBe(true);
  });

  it("fires on generic labels the model is prompted to produce", () => {
    expect(
      detectsCaseBarrage(photoOf("earbud case", "water bottle", "phone")),
    ).toBe(true);
  });

  it("fires on raw brand labels that skipped the scrubber", () => {
    expect(
      detectsCaseBarrage(
        photoOf("AirPods case", "plastic water bottle", "iPhone 15 Pro"),
      ),
    ).toBe(true);
  });

  // Every one of these is a label set GPT-4o actually returned for the same
  // photo on a different call. The recipe has to survive all of them or the
  // same three objects produce a different game each time.
  it.each([
    ["smartphone", "water bottle", "earbuds case"],
    ["bottle", "smartphone", "earbud case"],
    ["laptop", "bottle", "phone", "case"],
    ["charging case", "plastic bottle", "phone"],
    ["earbuds", "water bottle", "cellphone"],
  ])("survives the model's wording drift: %s / %s / %s", (...labels) => {
    expect(detectsCaseBarrage(photoOf(...labels))).toBe(true);
  });

  it.each([
    ["no case", ["water bottle", "smartphone"]],
    ["no bottle", ["earbud case", "smartphone"]],
    ["no phone", ["earbud case", "water bottle"]],
  ])("does not fire with %s", (_name, labels) => {
    expect(detectsCaseBarrage(photoOf(...labels))).toBe(false);
  });

  it("does not read 'headphones' as a phone", () => {
    expect(
      detectsCaseBarrage(photoOf("earbud case", "water bottle", "headphones")),
    ).toBe(false);
  });

  it("leaves ordinary photos to the seeded pick", () => {
    expect(detectsCaseBarrage(deskScene)).toBe(false);
    expect(detectsCaseBarrage(PREVIEW_ANALYSIS)).toBe(false);
    expect(recipeForAnalysis(deskScene)).toBeUndefined();
    expect(recipeForAnalysis(PREVIEW_ANALYSIS)).toBeUndefined();
  });

  // The signals are loose on purpose; this is the guard that keeps them from
  // stealing photos that belong to a campaign template.
  it("never hijacks another template's own photo", () => {
    for (const id of TEMPLATE_IDS) {
      const hit = recipeForAnalysis(TEMPLATES[id].previewAnalysis);
      expect(hit ?? id, `${id} was hijacked by ${hit}`).toBe(id);
    }
  });
});

describe("casebarrage selection", () => {
  it("is chosen for the trio photo regardless of seed or history", () => {
    for (const seed of [1, 7, 99, 4242, 918_273]) {
      const spec = buildTemplateSpec(CASEBARRAGE_SCENE, seed, {
        imageUrl: IMAGE_URL,
        // Even a history that just played it may not steer the pick away.
        recentTemplates: ["casebarrage", "casebarrage", "casebarrage"],
      });
      expect(spec.templateId).toBe("casebarrage");
    }
  });

  it("is never handed to a photo that lacks the trio", () => {
    for (let seed = 1; seed <= 4096; seed += 1) {
      expect(templateForSeed(seed)).not.toBe("casebarrage");
    }
    expect(CAMPAIGN_TEMPLATE_IDS).not.toContain("casebarrage");
  });

  it("still yields to the dev QA force override", () => {
    const spec = buildTemplateSpec(CASEBARRAGE_SCENE, 5, {
      imageUrl: IMAGE_URL,
      forceTemplate: "pantry",
    });
    expect(spec.templateId).toBe("pantry");
  });
});

describe("casebarrage level", () => {
  const spec = build(7);

  it("is a gauntlet won at the flag in front of the case", () => {
    expect(spec.mode).toBe("gauntlet");
    expect(winConditionFor(spec)).toBe("door");

    const turret = spec.entities.find(
      (entity) => entity.id === spec.gauntlet?.turretId,
    );
    expect(turret?.mechanic).toBe("hazard");
    expect(turret?.visual?.componentId).toBe("tech-earbud-case-open");

    const goal = entitiesOf(spec, "goal")[0];
    expect(goal.bounds.x).toBeGreaterThan(1300);
    expect(goal.bounds.x + goal.bounds.width).toBeLessThanOrEqual(
      turret!.bounds.x,
    );
  });

  it("fires earbuds out of the case", () => {
    expect(spec.gauntlet?.ammoComponentIds).toEqual(["tech-earbuds"]);
    expect(spec.gauntlet?.ammoLabel).toBe("earbud");
    // The player never shoots back — the case is the only thing firing.
    expect(spec.player.canShoot).toBeFalsy();
    expect(spec.projectile).toBeUndefined();
  });

  it("rains water bottles as pressure, not as the win condition", () => {
    expect(spec.skyfall?.componentIds).toEqual(["kit-water-bottle"]);
    expect(spec.skyfall?.dodgeCount).toBeUndefined();
    expect(spec.skyfall?.surviveSeconds).toBeUndefined();
  });

  it("keeps its hand-tuned cover where it was authored", () => {
    // randomizeShelters only re-rolls skyfall levels; a gauntlet carrying a
    // storm must not have its route slid out from under it.
    expect(randomizeShelters(spec, 7)).toBe(spec);
  });

  it("draws every entity with a bundled component", () => {
    for (const entity of spec.entities) {
      expect(getComponentById(entity.visual?.componentId), entity.id).toBeDefined();
    }
  });
});

describe("casebarrage phone placement", () => {
  it("is safe for every seed and eventually uses every pair of slots", () => {
    const pairs = new Set<string>();
    for (let seed = 1; seed <= 500; seed += 1) {
      const spec = build(seed);
      expect(isSpecSafe(spec), `seed ${seed}: ${collectSafetyIssues(spec).join("; ")}`).toBe(
        true,
      );
      const pads = entitiesOf(spec, "bounce_pad");
      expect(pads, `seed ${seed}`).toHaveLength(PHONE_PAD_COUNT);
      pairs.add(pads.map((pad) => pad.id).join("+"));
    }
    // Four slots, two phones — all six pairings should turn up.
    expect(pairs.size).toBe(6);
  });

  it("replays a stored seed identically", () => {
    for (const seed of [3, 77, 4242]) {
      expect(JSON.stringify(build(seed))).toBe(JSON.stringify(build(seed)));
    }
  });
});

describe.each([1, 2, 3, 7, 42, 99, 512, 4242, 65_535, 918_273])(
  "casebarrage at seed %i",
  (seed) => {
    const spec = build(seed);

    it("passes every runtime safety check", () => {
      expect(isSpecSafe(spec), collectSafetyIssues(spec).join("; ")).toBe(true);
    });

    it("puts exactly two phones down, both standable", () => {
      const pads = entitiesOf(spec, "bounce_pad");
      expect(pads).toHaveLength(PHONE_PAD_COUNT);

      const reachability = computeReachability(spec.entities);
      for (const pad of pads) {
        expect(pad.visual?.componentId).toBe("tech-phone-bounce-pad");
        expect(reachability.reachable.has(pad.id), pad.id).toBe(true);
      }
      // Two distinct spots, never stacked on the same slot.
      expect(new Set(pads.map((pad) => pad.bounds.x)).size).toBe(
        PHONE_PAD_COUNT,
      );
    });

    it("gives each phone a ledge only a bounce can reach", () => {
      const reachability = computeReachability(spec.entities);
      const ground = reachability.nodes.find((node) => node.id === "ground")!;

      for (const pad of entitiesOf(spec, "bounce_pad")) {
        const station = pad.id.slice(pad.id.lastIndexOf("-") + 1);
        const perch = spec.entities.find(
          (entity) => entity.id === `casebarrage-perch-${station}`,
        );
        expect(perch, `no perch for ${pad.id}`).toBeDefined();

        const perchNode = toPlatformNode(perch!);
        expect(canJump(toPlatformNode(pad), perchNode)).toBe(true);
        expect(canJump(ground, perchNode)).toBe(false);
        expect(reachability.reachable.has(perch!.id)).toBe(true);
      }
    });
  },
);
