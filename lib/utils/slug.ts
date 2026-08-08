const WORDS = [
  "pixel",
  "brass",
  "neon",
  "paper",
  "copper",
  "quartz",
  "cosmic",
  "velvet",
];

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base.length >= 3 ? base : "snapcade-game";
}

function suffix(seed: number): string {
  const word = WORDS[seed % WORDS.length];
  const number = (seed % 900) + 100;
  return `${word}-${number}`;
}

/**
 * Deterministically builds a unique slug, adding a readable suffix until the
 * caller's uniqueness check passes.
 */
export async function generateUniqueSlug(
  title: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugifyTitle(title);
  if (!(await isTaken(base))) return base;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = `${base}-${suffix(
      Math.floor(Math.random() * 100000) + attempt,
    )}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}
