import type { TemplateId } from "./index";

/**
 * The players credited with each seeded arcade game. Every campaign level is
 * presented as someone's photo of their own home, so the arcade reads like a
 * community rather than a single first-party account.
 */
export const CREATOR_BY_TEMPLATE: Record<TemplateId, string> = {
  pantry: "snackgoblin",
  sockdrawer: "mira.folds",
  bathtime: "duck_dynasty",
  desktidy: "wfh_wendy",
  quest: "counter.culture",
  dodge: "storm_in_a_mug",
  couchcoins: "couch_potato",
  toolrange: "garage_gav",
  laundryline: "spin_cycle_sam",
  gauntlet: "fridge_raider",
  jamsession: "encore.ellis",
  beeswarm: "backyard_bex",
  fridgeraid: "midnight.mika",
  toyblitz: "toybox_tariq",
  rafters: "rafter_rae",
  officeovertime: "overtime_omar",
  midnightsnack: "2am_nadia",
  driveway: "driveway_dev",
  trickshots: "gymbag_gil",
  microwavemayhem: "mayhem_maya",
  atticascent: "attic_arlo",
  toystorm: "playroom_priya",
  partycrash: "party_crasher",
};
