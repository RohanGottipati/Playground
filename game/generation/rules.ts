import type { GameRules, GameSpec } from "@/game/types";

const BASE_CONTROLS = [
  "Move: A / D or arrow keys (on-screen buttons on mobile)",
  "Jump: W, ↑ or Space",
  "Restart: R",
];

const SHOOT_CONTROL = "Shoot: X or F (Shoot button on mobile)";

type RulesInput = {
  mode: NonNullable<GameSpec["mode"]>;
  objectLabels: string[];
  collectibleCount: number;
  targetCount: number;
  ammoLabel?: string;
  skyfallLabel?: string;
  rushTimeLimitSeconds?: number;
};

function listObjects(labels: string[]): string {
  const unique = [...new Set(labels)].slice(0, 4);
  if (unique.length === 0) return "everyday objects";
  if (unique.length === 1) return unique[0];
  return `${unique.slice(0, -1).join(", ")} and ${unique[unique.length - 1]}`;
}

/**
 * Builds the mode-specific rule sheet shown in the popup before every game.
 * Wording references the actual photographed objects so each sheet is unique
 * to its level.
 */
export function buildRules(input: RulesInput): GameRules {
  const objects = listObjects(input.objectLabels);

  switch (input.mode) {
    case "shooter":
      return {
        headline: "Blast the drones, then escape",
        objective: `Destroy all ${input.targetCount} drones hovering over the course built from your ${objects}, then reach the exit door. The door stays locked until every drone is down.`,
        howToPlay: [
          `Fire ${input.ammoLabel ?? "donut"}s in the direction you are facing; shots fly straight and pass over platforms.`,
          "Line up with a drone's height by climbing nearby platforms, then shoot.",
          "Touching a drone hurts. Keep your distance and shoot first.",
          input.collectibleCount > 0
            ? `Grab the ${input.collectibleCount} bonus collectibles along the way if you can.`
            : "Watch out for hazards between you and the drones.",
        ],
        controls: [...BASE_CONTROLS, SHOOT_CONTROL],
        tip: "You can shoot while jumping — a mid-air shot lines up with taller drones.",
      };

    case "skyfall":
      return {
        headline: "Everything is falling. Keep moving",
        objective: `Cross the course built from your ${objects} and reach the exit door while ${input.skyfallLabel ?? "objects"} rain from the sky.`,
        howToPlay: [
          `${capitalize(input.skyfallLabel ?? "objects")} fall from above at random spots — one touch sends you back to the start.`,
          "Falling objects vanish when they hit the ground, so short pauses between waves are your chance to move.",
          "The area right at your spawn is a safe zone; nothing falls there.",
          input.collectibleCount > 0
            ? `The ${input.collectibleCount} collectibles are optional but brag-worthy.`
            : "Stay under overhangs when you can.",
        ],
        controls: BASE_CONTROLS,
        tip: "Watch the sky above the gap you are about to cross, not your feet.",
      };

    case "rush":
      return {
        headline: "Collect everything before the clock runs out",
        objective: `Gather all ${input.collectibleCount} collectibles scattered across your ${objects} within ${input.rushTimeLimitSeconds ?? 60} seconds. The exit door only unlocks once you have them all.`,
        howToPlay: [
          "Every collectible counts — the door will not open while even one remains.",
          `The timer starts the moment you move. Run out of time and the level resets.`,
          "Plan a route: grab far collectibles first, then loop back toward the door.",
          "Hazards still hurt; dying wastes precious seconds.",
        ],
        controls: BASE_CONTROLS,
        tip: "The HUD shows the time left and how many collectibles remain.",
      };

    case "classic":
    default:
      return {
        headline: "Reach the exit door",
        objective: `Make it across the course built from your ${objects} and touch the exit door on the far side.`,
        howToPlay: [
          "Platforms made from your photographed objects are solid — jump between them.",
          "Spiky or sharp objects hurt; touching one sends you back to the start.",
          "Bouncy objects launch you higher than a normal jump.",
          input.collectibleCount > 0
            ? `Collect the ${input.collectibleCount} shiny pickups for bonus glory.`
            : "The fastest time tops the leaderboard.",
        ],
        controls: BASE_CONTROLS,
        tip: "Deaths only cost time — the run keeps going until you finish.",
      };
  }
}

/** Legacy games published before rules existed still get a usable sheet. */
export function fallbackRules(spec: GameSpec): GameRules {
  if (spec.rules) return spec.rules;
  const labels = spec.entities
    .map((entity) => entity.sourceLabel)
    .filter((label): label is string => Boolean(label));
  return buildRules({
    mode: spec.mode ?? "classic",
    objectLabels: labels,
    collectibleCount: spec.entities.filter(
      (entity) => entity.mechanic === "collectible",
    ).length,
    targetCount: spec.entities.filter((entity) => entity.mechanic === "target")
      .length,
    ammoLabel: spec.projectile?.label,
    skyfallLabel: spec.skyfall?.label,
    rushTimeLimitSeconds: spec.rush?.timeLimitSeconds,
  });
}

function capitalize(value: string): string {
  return value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}
