/**
 * Canonical component generation library.
 *
 * Keep this module free of React/browser imports: it is consumed both by the
 * Next.js application and by scripts/sync-component-catalog.mjs.
 */

const SUPPORTED_MECHANICS = new Set([
  "static_platform",
  "moving_platform",
  "bounce_pad",
  "hazard",
  "collectible",
  "portal",
  "goal",
]);

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function coreEntry(category, row) {
  const [
    id,
    name,
    runtimeScope = "future",
    mechanic = null,
    rendererKey = null,
    tags = [],
  ] = row;
  if (mechanic !== null && !SUPPORTED_MECHANICS.has(mechanic)) {
    throw new Error(`Unsupported mechanic ${mechanic} for ${id}`);
  }
  return {
    id,
    name,
    category,
    description: `${name} from the supplied ${category} component set.`,
    tags: [category, ...tags],
    aliases: [name.toLowerCase()],
    runtimeScope,
    mechanic,
    rendererKey,
    enabled: true,
    metadata: {
      source: "supplied-component-library",
      componentType: category === "hud" || category === "controls" || category === "panels" || category === "overlays" ? "ui" : "sprite",
    },
  };
}

const CORE_GROUPS = {
  characters: [
    ["character-arcade-hero", "Arcade hero", "player", null, "player.arcade-hero", ["player", "playable"]],
    ["character-runner", "Runner"],
    ["character-ninja", "Ninja"],
    ["character-robot", "Robot"],
    ["character-wizard", "Wizard"],
    ["character-knight", "Knight"],
    ["character-alien", "Alien"],
    ["character-ghost", "Ghost"],
    ["character-cat", "Cat adventurer"],
    ["character-dog", "Dog adventurer"],
    ["character-pirate", "Pirate"],
    ["character-astronaut", "Astronaut"],
  ],
  enemies: [
    ["enemy-slime", "Slime enemy"],
    ["enemy-bat", "Bat enemy"],
    ["enemy-bee", "Bee enemy"],
    ["enemy-spider", "Spider enemy"],
    ["enemy-crab", "Crab enemy"],
    ["enemy-ghost", "Ghost enemy"],
    ["enemy-robot", "Robot enemy"],
    // Unique rendererKey keeps the turret out of the generic hazard pool:
    // it is only ever chosen explicitly (gauntlet machine fallback).
    ["enemy-turret", "Turret enemy", "entity", "hazard", "turret-cannon", ["turret", "runtime"]],
    ["enemy-mushroom", "Mushroom enemy"],
    ["enemy-snake", "Snake enemy"],
    ["enemy-fish", "Fish enemy"],
    ["enemy-bird", "Bird enemy"],
    ["enemy-fireball", "Fireball enemy"],
    ["enemy-spike-ball", "Spike-ball enemy"],
    ["enemy-boss-golem", "Golem boss"],
    ["enemy-boss-dragon", "Dragon boss"],
  ],
  terrain: [
    ["terrain-book-platform", "Book platform", "entity", "static_platform", "book-platform", ["platform", "runtime"]],
    ["terrain-pencil-bridge", "Pencil bridge", "entity", "static_platform", "pencil-bridge", ["platform", "bridge", "runtime"]],
    ["terrain-bottle-tower", "Bottle tower", "entity", "static_platform", "bottle-tower", ["platform", "tower", "runtime"]],
    ["terrain-crate-platform", "Crate platform", "entity", "static_platform", "crate-platform", ["platform", "runtime"]],
    ["terrain-helper-platform", "Helper platform", "entity", "static_platform", "helper-platform", ["platform", "generated", "runtime"]],
    ["terrain-moving-platform", "Moving platform", "entity", "moving_platform", "moving-platform", ["platform", "moving", "runtime"]],
    ["terrain-grass-platform", "Grass platform"],
    ["terrain-dirt-block", "Dirt block"],
    ["terrain-brick-block", "Brick block"],
    ["terrain-stone-block", "Stone block"],
    ["terrain-ice-platform", "Ice platform"],
    ["terrain-cloud-platform", "Cloud platform"],
    ["terrain-wood-bridge", "Wood bridge"],
    ["terrain-rope-bridge", "Rope bridge"],
    ["terrain-one-way-platform", "One-way platform"],
  ],
  hazards: [
    ["hazard-spike-strip", "Spike strip", "entity", "hazard", "spike-strip", ["runtime"]],
    ["hazard-scissors", "Scissors hazard", "entity", "hazard", "scissors", ["sharp", "runtime"]],
    ["hazard-saw-blade", "Saw blade", "entity", "hazard", "saw-blade", ["sharp", "runtime"]],
    ["hazard-fire", "Fire hazard"],
    ["hazard-lava", "Lava hazard"],
    ["hazard-electric", "Electric hazard"],
    ["hazard-falling-rock", "Falling rock"],
    ["hazard-crusher", "Crusher"],
    ["hazard-laser", "Laser"],
    ["hazard-poison", "Poison pool"],
    ["hazard-icicle", "Falling icicle"],
    ["hazard-wind", "Wind gust"],
  ],
  mechanics: [
    ["mechanic-bounce-pad", "Bounce pad", "entity", "bounce_pad", "bounce-pad", ["runtime"]],
    ["mechanic-mug-bouncer", "Mug bouncer", "entity", "bounce_pad", "mug-bouncer", ["runtime"]],
    ["mechanic-trampoline", "Trampoline", "entity", "bounce_pad", "trampoline", ["runtime"]],
    ["mechanic-portal-gate", "Portal gate", "entity", "portal", "portal-gate", ["runtime"]],
    ["mechanic-exit-door", "Exit door", "entity", "goal", "exit-door", ["runtime"]],
    ["mechanic-checkpoint", "Checkpoint"],
    ["mechanic-pressure-plate", "Pressure plate"],
    ["mechanic-lever", "Lever"],
    ["mechanic-key-door", "Key door"],
    ["mechanic-breakable-block", "Breakable block"],
    ["mechanic-pushable-block", "Pushable block"],
    ["mechanic-ladder", "Ladder"],
    ["mechanic-rope", "Climbing rope"],
    ["mechanic-zip-line", "Zip line"],
    ["mechanic-fan", "Updraft fan"],
    ["mechanic-conveyor", "Conveyor belt"],
    ["mechanic-teleporter", "Teleporter"],
    ["mechanic-timed-switch", "Timed switch"],
    ["mechanic-secret-wall", "Secret wall"],
    ["mechanic-water-current", "Water current"],
  ],
  collectibles: [
    ["collectible-coin", "Coin", "entity", "collectible", "coin", ["runtime"]],
    ["collectible-gem", "Gem", "entity", "collectible", "gem", ["runtime"]],
    ["collectible-eraser", "Eraser collectible", "entity", "collectible", "eraser", ["runtime"]],
    ["collectible-key", "Key collectible", "entity", "collectible", "key", ["runtime"]],
    ["collectible-battery", "Battery collectible", "entity", "collectible", "battery", ["runtime"]],
    ["collectible-star", "Star"],
    ["collectible-heart", "Heart"],
    ["collectible-trophy", "Trophy"],
    ["collectible-chest", "Treasure chest"],
    ["collectible-potion", "Potion"],
    ["collectible-magnet", "Magnet power-up"],
    ["collectible-shield", "Shield power-up"],
  ],
  decor: [
    ["decor-skyline", "Arcade skyline", "world", null, "world.arcade-skyline", ["runtime"]],
    ["decor-ground", "Arcade ground", "world", null, "world.arcade-ground", ["runtime"]],
    ["decor-cloud", "Cloud decoration"],
    ["decor-tree", "Tree decoration"],
    ["decor-bush", "Bush decoration"],
    ["decor-flower", "Flower decoration"],
    ["decor-rock", "Rock decoration"],
    ["decor-sign", "Direction sign"],
    ["decor-lamp", "Street lamp"],
    ["decor-fence", "Fence decoration"],
    ["decor-banner", "Arcade banner"],
    ["decor-confetti", "Confetti"],
    ["decor-neon-star", "Neon star"],
    ["decor-particle-spark", "Spark particle"],
    ["decor-finish-flag", "Finish flag", "entity", "goal", "exit-door", ["goal", "runtime"]],
  ],
  hud: [
    ["hud-game", "Game HUD", "ui", null, "GameHUD", ["runtime"]],
    ["hud-score", "Score counter", "ui"],
    ["hud-timer", "Timer display", "ui"],
    ["hud-health", "Health bar", "ui"],
    ["hud-lives", "Lives counter", "ui"],
    ["hud-collectibles", "Collectible counter", "ui"],
    ["hud-checkpoint", "Checkpoint indicator", "ui"],
    ["hud-minimap", "Mini map", "ui"],
    ["hud-objective", "Objective display", "ui"],
    ["hud-speedrun", "Speedrun split", "ui"],
  ],
  controls: [
    ["controls-touch", "Touch controls", "ui", null, "TouchControls", ["runtime"]],
    ["controls-dpad", "Directional pad", "ui"],
    ["controls-jump", "Jump button", "ui"],
    ["controls-action", "Action button", "ui"],
    ["controls-pause", "Pause button", "ui"],
    ["controls-restart", "Restart button", "ui"],
    ["controls-keyboard-hint", "Keyboard controls hint", "ui"],
    ["controls-mobile-hint", "Mobile controls hint", "ui"],
  ],
  panels: [
    ["panel-game-player", "Game player", "ui", null, "GamePlayer", ["runtime"]],
    ["panel-game-results", "Game results", "ui", null, "GameResults", ["runtime"]],
    ["panel-leaderboard", "Leaderboard panel", "ui", null, "LeaderboardPanel", ["runtime"]],
    ["panel-publish", "Publish panel", "ui", null, "PublishPanel", ["runtime"]],
    ["panel-arcade-cabinet", "Arcade cabinet", "ui", null, "ArcadeCabinet", ["runtime"]],
    ["panel-game-card", "Game card", "ui"],
    ["panel-level-complete", "Level complete panel", "ui"],
    ["panel-pause-menu", "Pause menu", "ui"],
    ["panel-settings", "Settings panel", "ui"],
    ["panel-share", "Share panel", "ui"],
  ],
  overlays: [
    ["overlay-scan", "Scan overlay", "ui", null, "ScanAnimation", ["runtime"]],
    ["overlay-generation-progress", "Generation progress", "ui", null, "GenerationProgress", ["runtime"]],
    ["overlay-loading", "Loading overlay", "ui"],
    ["overlay-countdown", "Countdown overlay", "ui"],
    ["overlay-death", "Death overlay", "ui"],
    ["overlay-completion", "Completion overlay", "ui"],
    ["overlay-tutorial", "Tutorial overlay", "ui"],
    ["overlay-notification", "Notification overlay", "ui"],
  ],
};

const MECHANIC_BY_OBJECT_TAG = {
  platform: "static_platform",
  block: "static_platform",
  wall: "static_platform",
  checkpoint: "static_platform",
  vehicle: "moving_platform",
  moving: "moving_platform",
  lift: "moving_platform",
  float: "moving_platform",
  bounce: "bounce_pad",
  launcher: "bounce_pad",
  hazard: "hazard",
  collectible: "collectible",
  health: "collectible",
  powerup: "collectible",
  cosmetic: "collectible",
  reward: "collectible",
  currency: "collectible",
  key: "collectible",
  door: "portal",
};

function objectEntry(group, row) {
  const [name, mechanicTag, animated = false, aliases = []] = row;
  const mechanic = MECHANIC_BY_OBJECT_TAG[mechanicTag] ?? null;
  const id = `${group.prefix}-${slug(name)}`;
  return {
    id,
    name,
    category: group.category,
    description: `${name} everyday-object sprite with the supplied ${mechanicTag} behavior concept.`,
    tags: ["everyday", mechanicTag, group.category],
    aliases: [name.toLowerCase(), ...aliases],
    // Artwork is always renderable. `mechanic` is only the preferred mapping;
    // physics still comes from the validated GameEntitySpec.
    runtimeScope: "entity",
    mechanic,
    rendererKey: `object.${id}`,
    enabled: true,
    metadata: {
      source: "supplied-component-library",
      componentType: "object-sprite",
      animated,
      mechanicTag,
    },
  };
}

const OBJECT_GROUPS = [
  {
    category: "furniture",
    prefix: "fur",
    rows: [
      ["Sofa", "platform"], ["Bed", "checkpoint"], ["Desk", "platform"],
      ["Stool", "platform"], ["Wardrobe", "wall"], ["Rug", "trigger"],
      ["Mirror", "puzzle", true], ["Window", "destructible"], ["Door", "door"],
      ["Picture frame", "decor"], ["Potted plant", "decor", true],
      ["Curtain", "secret", true], ["Filing cabinet", "pushable"],
      ["Ceiling fan", "force", true], ["Step ladder", "traversal"],
    ],
  },
  {
    category: "kitchen",
    prefix: "kit",
    rows: [
      ["Mug", "block", true, ["cup"]], ["Kettle", "hazard", true],
      ["Toaster", "launcher", true], ["Frying pan", "weapon"],
      ["Cooking pot", "container", false, ["pot"]], ["Fridge", "wall", false, ["refrigerator"]],
      ["Microwave", "hazard", true], ["Blender", "hazard", true],
      ["Plate", "platform"], ["Fork", "hazard"], ["Knife", "hazard"],
      ["Rolling pin", "hazard", true], ["Bottle", "destructible"],
      ["Tin can", "pushable", false, ["can"]], ["Cutting board", "platform"],
      ["Cereal box", "pushable"],
      ["Water bottle", "destructible", true, ["plastic bottle", "plastic water bottle", "single-use bottle"]],
    ],
  },
  {
    category: "food",
    prefix: "food",
    rows: [
      ["Pizza slice", "health", true, ["pizza"]], ["Burger", "health", true],
      ["Donut", "collectible", true, ["doughnut"]], ["Apple", "health", true],
      ["Banana peel", "hazard", false, ["banana"]], ["Watermelon", "collectible", true],
      ["Ice cream", "timed", true], ["Cupcake", "collectible", true],
      ["Sushi", "block", true], ["Taco", "platform"], ["Hot dog", "platform"],
      ["Coffee cup", "powerup", true, ["coffee"]], ["Soda can", "powerup", true, ["soda"]],
      ["Egg", "destructible", true], ["Cheese", "platform"],
      ["Carrot", "collectible", true], ["Popcorn", "spawner", true],
      ["Lollipop", "sticky", true],
    ],
  },
  {
    category: "tech",
    prefix: "tech",
    rows: [
      ["Laptop", "checkpoint", true], ["Smartphone", "utility", true, ["phone", "mobile phone"]],
      ["Tablet", "platform"], ["Television", "decor", true, ["tv"]],
      ["Keyboard", "platform"], ["Computer mouse", "pushable", false, ["mouse"]],
      ["Headphones", "powerup", true], ["Speaker", "hazard", true],
      ["Game controller", "powerup", true, ["controller", "gamepad"]],
      ["Camera", "hub", true], ["Light bulb", "light", true, ["lightbulb"]],
      ["Router", "checkpoint", true], ["Boombox", "spawner", true],
      ["Desk lamp", "light", true, ["lamp"]], ["Wall clock", "timed", true, ["clock"]],
      ["Vacuum cleaner", "force", true, ["vacuum"]],
      // Brand names never reach the pipeline (lib/utils/genericName.ts scrubs
      // them), so these carry both the generic and the scrubbed-from aliases.
      ["Earbud case", "container", true, ["airpods case", "earbuds case", "charging case"]],
      ["Earbud case open", "hazard", true, ["open earbud case", "open charging case"]],
      ["Earbuds", "collectible", true, ["airpods", "earphones", "wireless earbuds"]],
      ["Phone bounce pad", "launcher", true, ["phone launcher", "phone trampoline"]],
    ],
  },
  {
    category: "stationery",
    prefix: "stat",
    rows: [
      ["Pencil", "platform"], ["Pen", "weapon"], ["Eraser", "puzzle", false, ["rubber"]],
      ["Ruler", "platform"], ["Scissors", "tool", false, ["shears"]],
      ["Stapler", "puzzle"], ["Notebook", "checkpoint", false, ["sketchbook"]],
      ["Book", "block"], ["Backpack", "powerup", true, ["rucksack"]],
      ["Calculator", "puzzle"], ["Paperclip", "traversal", true, ["paper clip"]],
      ["Sticky note", "tutorial", true, ["post-it", "post it"]],
      ["Tape roll", "sticky", true, ["tape"]], ["Globe", "hub", true],
      ["Alarm clock", "timed", true], ["Whiteboard", "tutorial"],
    ],
  },
  {
    category: "sports",
    prefix: "sport",
    rows: [
      ["Basketball", "bounce", true], ["Football", "physics", true, ["soccer ball"]],
      ["Tennis racket", "weapon"], ["Baseball bat", "weapon"],
      ["Skateboard", "vehicle", true], ["Bicycle", "vehicle", true, ["bike"]],
      ["Helmet", "armour", true], ["Dumbbell", "pushable"],
      ["Jump rope", "traversal", true, ["skipping rope"]], ["Surfboard", "vehicle", true],
      ["Skis", "vehicle"], ["Hockey stick", "weapon"],
      ["Boxing glove", "hazard", true], ["Frisbee", "weapon", true],
      ["Bowling ball", "hazard", true], ["Bowling pin", "target"],
      ["Yoga mat", "platform"], ["Roller skate", "powerup", true],
    ],
  },
  {
    category: "vehicles",
    prefix: "veh",
    rows: [
      ["Car", "vehicle", true], ["Bus", "vehicle", true], ["Truck", "vehicle", true],
      ["Train", "vehicle", true], ["Aeroplane", "vehicle", true, ["airplane", "plane"]],
      ["Rocket", "launcher", true], ["Boat", "vehicle", true],
      ["Scooter", "vehicle", true], ["Motorcycle", "vehicle", true, ["motorbike"]],
      ["Helicopter", "vehicle", true], ["Hot air balloon", "lift", true, ["balloon"]],
      ["Shopping trolley", "pushable", false, ["shopping cart", "cart"]],
      ["Wheelbarrow", "container"], ["Traffic cone", "obstacle", false, ["cone"]],
      ["Traffic light", "timed", true], ["Tyre", "bounce", true, ["tire"]],
      ["Fuel pump", "refill"],
    ],
  },
  {
    category: "tools",
    prefix: "tool",
    rows: [
      ["Hammer", "tool"], ["Screwdriver", "tool"], ["Wrench", "tool", true, ["spanner"]],
      ["Handsaw", "tool", false, ["saw"]], ["Power drill", "tool", true, ["drill"]],
      ["Paint bucket", "utility"], ["Paint brush", "utility", false, ["paintbrush"]],
      ["Toolbox", "container"], ["Tape measure", "utility"], ["Broom", "weapon", true],
      ["Bucket", "container"], ["Watering can", "tool"], ["Shovel", "tool"],
      ["Flashlight", "light", true, ["torch"]], ["Rope coil", "traversal", false, ["rope"]],
      ["Chain", "connector", true], ["Nail", "hazard"], ["Plunger", "traversal"],
    ],
  },
  {
    category: "clothing",
    prefix: "cloth",
    rows: [
      ["T-shirt", "cosmetic", true, ["tshirt", "shirt"]], ["Cap", "cosmetic", true, ["hat"]],
      ["Trainer", "powerup", true, ["sneaker", "shoe"]], ["Boot", "powerup"],
      ["Sock", "physics", true], ["Glove", "powerup", true], ["Scarf", "cosmetic", true],
      ["Jacket", "armour"], ["Sunglasses", "utility", true, ["glasses"]],
      ["Wristwatch", "powerup", true, ["watch"]], ["Coat hanger", "traversal", true, ["hanger"]],
      ["Top hat", "cosmetic", true], ["Belt", "utility"],
      ["Swim ring", "utility", true, ["pool float"]], ["Flip flop", "decor"],
    ],
  },
  {
    category: "outdoors",
    prefix: "out",
    rows: [
      ["Flower", "collectible", true], ["Cactus", "hazard"], ["Log", "platform"],
      ["Tree stump", "platform", false, ["stump"]], ["Puddle", "slow", true],
      ["Snowman", "destructible", true], ["Sandcastle", "timed"],
      ["Seashell", "collectible", true, ["shell"]], ["Beach ball", "bounce", true],
      ["Beehive", "spawner", true], ["Feather", "powerup", true], ["Nest", "platform"],
      ["Lightning", "hazard", true], ["Rainbow", "platform", true],
      ["Anthill", "spawner"], ["Mushroom cluster", "bounce", true, ["mushrooms"]],
    ],
  },
  {
    category: "toys",
    prefix: "toy",
    rows: [
      ["Teddy bear", "companion", true, ["teddy"]], ["Rubber duck", "float", true, ["duck"]],
      ["Building brick", "block", false, ["toy brick"]], ["Dice", "random", true, ["die"]],
      ["Kite", "glider", true], ["Yo-yo", "traversal", true, ["yoyo"]],
      ["Spinning top", "hazard", true], ["Marble", "physics", true],
      ["Puzzle piece", "collectible", true], ["Toy car", "moving", true],
      ["Playing cards", "timed", false, ["cards"]], ["Bubble wand", "spawner", true],
      ["Pinwheel", "switch", true], ["Jack-in-the-box", "launcher", true, ["jack in the box"]],
      ["Action figure", "collectible", true],
    ],
  },
  {
    category: "music",
    prefix: "mus",
    rows: [
      ["Guitar", "weapon", true], ["Drum", "bounce", true], ["Piano keys", "puzzle", false, ["piano"]],
      ["Trumpet", "force", true], ["Microphone", "weapon", true, ["mic"]],
      ["Vinyl record", "platform", true, ["record", "vinyl"]], ["Violin", "weapon"],
      ["Xylophone", "platform"], ["Maracas", "weapon", true],
      ["Cassette tape", "collectible", true, ["cassette"]],
      ["Tambourine", "bounce", true], ["Harmonica", "collectible"],
    ],
  },
  {
    category: "household",
    prefix: "house",
    rows: [
      ["Toilet roll", "physics", true, ["toilet paper"]], ["Toothbrush", "collectible"],
      ["Soap bar", "slippery", false, ["soap"]], ["Towel", "traversal", true],
      ["Bathtub", "container"], ["Washing machine", "hazard", true],
      ["Laundry basket", "container"], ["Iron", "hazard"], ["Bin", "stealth", false, ["trash bin"]],
      ["Candle", "light", true], ["Wallet", "currency"], ["Key ring", "key", true, ["keyring"]],
      ["Gift box", "reward", true, ["present"]], ["Birthday cake", "reward", true, ["cake"]],
      ["Party balloons", "lift", true, ["balloons"]], ["Party hat", "cosmetic", true],
      ["Fire extinguisher", "tool", false, ["extinguisher"]],
      ["Post box", "tutorial", false, ["mailbox"]], ["Piggy bank", "currency", true],
    ],
  },
];

export const componentCatalogData = Object.freeze([
  ...Object.entries(CORE_GROUPS).flatMap(([category, rows]) =>
    rows.map((row) => coreEntry(category, row)),
  ),
  ...OBJECT_GROUPS.flatMap((group) =>
    group.rows.map((row) => objectEntry(group, row)),
  ),
]);

export const componentCatalogCounts = Object.freeze({
  core: Object.values(CORE_GROUPS).reduce((count, rows) => count + rows.length, 0),
  objects: OBJECT_GROUPS.reduce((count, group) => count + group.rows.length, 0),
  total: componentCatalogData.length,
});
