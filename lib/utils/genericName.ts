/**
 * Published games must never name specific products. Detected labels and
 * titles are rewritten to generic object nouns before anything is stored,
 * rendered, or sent to the arcade.
 */

type Replacement = { pattern: RegExp; generic: string };

// Order matters: multi-word product names are matched before single tokens.
const REPLACEMENTS: Replacement[] = [
  // Drinks
  { pattern: /\b(coca[\s-]?cola|coke|pepsi|dr\.?\s?pepper|mountain dew|sprite|fanta|7[\s-]?up|red\s?bull|monster energy|celsius|gatorade|la\s?croix)\b/gi, generic: "soda" },
  { pattern: /\b(starbucks|dunkin'?|nespresso|keurig)\b/gi, generic: "coffee" },
  { pattern: /\b(evian|fiji|dasani|aquafina|smartwater|voss)\b/gi, generic: "water" },
  // Snacks
  { pattern: /\b(doritos|lays|pringles|cheetos|ruffles|takis|fritos)\b/gi, generic: "chips" },
  { pattern: /\b(oreo|kitkat|kit kat|snickers|m&m'?s|skittles|twix|reese'?s|haribo)\b/gi, generic: "candy" },
  // Tech
  { pattern: /\b(iphone|galaxy (s|z|note)\s?\d*\+?|pixel \d+\w*)\b/gi, generic: "phone" },
  { pattern: /\b(ipad|galaxy tab)\b/gi, generic: "tablet" },
  { pattern: /\b(macbook( pro| air)?|thinkpad|chromebook|surface laptop)\b/gi, generic: "laptop" },
  { pattern: /\b(airpods?( pro| max)?|earpods|galaxy buds)\b/gi, generic: "earbuds" },
  { pattern: /\b(apple watch|fitbit|garmin)\b/gi, generic: "smartwatch" },
  { pattern: /\b(nintendo switch|gameboy|game boy|playstation|dualshock|dualsense|xbox)( controller| console)?\b/gi, generic: "game controller" },
  { pattern: /\b(beats|bose|sony wh-\w+|jbl)\b/gi, generic: "headphones" },
  { pattern: /\b(logitech|razer|corsair)\b/gi, generic: "computer" },
  // Toys
  { pattern: /\b(lego|duplo)\b/gi, generic: "toy brick" },
  { pattern: /\b(barbie|bratz)\b/gi, generic: "doll" },
  { pattern: /\b(hot wheels|matchbox car)\b/gi, generic: "toy car" },
  { pattern: /\b(rubik'?s cube)\b/gi, generic: "puzzle cube" },
  { pattern: /\b(nerf)\b/gi, generic: "toy blaster" },
  // Stationery / household
  { pattern: /\b(sharpie)\b/gi, generic: "marker" },
  { pattern: /\b(post-?it( note)?s?)\b/gi, generic: "sticky note" },
  { pattern: /\b(scotch tape)\b/gi, generic: "tape" },
  { pattern: /\b(band-?aid)\b/gi, generic: "bandage" },
  { pattern: /\b(kleenex)\b/gi, generic: "tissue" },
  { pattern: /\b(clorox|lysol|windex)\b/gi, generic: "cleaner" },
  { pattern: /\b(advil|tylenol|ibuprofen bottle)\b/gi, generic: "pill bottle" },
  { pattern: /\b(chapstick)\b/gi, generic: "lip balm" },
  { pattern: /\b(tupperware)\b/gi, generic: "food container" },
  { pattern: /\b(brita)\b/gi, generic: "water pitcher" },
  { pattern: /\b(zippo)\b/gi, generic: "lighter" },
  // Apparel
  { pattern: /\b(nike|adidas|puma|converse|vans|new balance|jordan)s?\b/gi, generic: "sneaker" },
  { pattern: /\b(crocs)\b/gi, generic: "sandal" },
  { pattern: /\b(ray-?bans?|oakley)\b/gi, generic: "sunglasses" },
  // Leftover manufacturer tokens that add nothing generic
  { pattern: /\b(apple|samsung|google|sony|microsoft|amazon|dell|hp|lenovo|asus|acer|canon|nikon|dyson|kitchenaid|nestle|kraft|heinz)\b(?=\s+\w)/gi, generic: "" },
];

const TRADEMARK_SYMBOLS = /[™®©]/g;

function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Rewrites brand and product names into generic nouns. "coca-cola can"
 * becomes "soda can", "iPhone 15 Pro" becomes "phone".
 */
export function scrubBrandNames(value: string): string {
  let output = value.replace(TRADEMARK_SYMBOLS, "");
  for (const { pattern, generic } of REPLACEMENTS) {
    output = output.replace(pattern, generic);
  }
  // Strip dangling model suffixes left behind, e.g. "phone 15 pro" -> "phone".
  output = output.replace(/(?<=\w)\s+\d{1,4}(\s?(pro|max|plus|ultra|mini|air|se))?\s*$/gi, "");
  return collapseSpaces(output) || "object";
}

/** True when scrubbing changed anything, useful for logging and tests. */
export function containsBrandName(value: string): boolean {
  return scrubBrandNames(value).toLowerCase() !== collapseSpaces(value.replace(TRADEMARK_SYMBOLS, "")).toLowerCase();
}
