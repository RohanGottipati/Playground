export type ThemePalette = {
  background: number;
  backgroundAccent: number;
  ground: number;
  platform: number;
  movingPlatform: number;
  bouncePad: number;
  hazard: number;
  collectible: number;
  portal: number;
  goal: number;
  player: number;
  label: string;
};

const DEFAULT_PALETTE: ThemePalette = {
  background: 0x11131c,
  backgroundAccent: 0x1d2233,
  ground: 0x3b2f2a,
  platform: 0xd8c9a3,
  movingPlatform: 0x8fd4c1,
  bouncePad: 0xf2a6c0,
  hazard: 0xe4574f,
  collectible: 0xf7d060,
  portal: 0x9d7bf5,
  goal: 0x63e6a8,
  player: 0xf5f2e8,
  label: "#f7f4ea",
};

const PALETTES: Record<string, Partial<ThemePalette>> = {
  arcade: {},
  space: {
    background: 0x07070f,
    backgroundAccent: 0x151534,
    platform: 0xb8c4e8,
    goal: 0x7ce7ff,
  },
  forest: {
    background: 0x10201a,
    backgroundAccent: 0x1c3327,
    ground: 0x24402c,
    platform: 0xa9d08a,
    collectible: 0xffe08a,
  },
  factory: {
    background: 0x16171a,
    backgroundAccent: 0x25272d,
    platform: 0xb0b4bb,
    movingPlatform: 0xf0a24b,
  },
  neon: {
    background: 0x0b0a1a,
    backgroundAccent: 0x1b0f3a,
    platform: 0x30f2d0,
    hazard: 0xff2e88,
    collectible: 0xfaff70,
    goal: 0x7cf9ff,
  },
  paper: {
    background: 0xf3ece0,
    backgroundAccent: 0xe6dcc9,
    ground: 0xcbb99a,
    platform: 0x8c7a5e,
    player: 0x2b2b2b,
    label: "#2b2b2b",
  },
  kitchen: {
    background: 0x1b1614,
    backgroundAccent: 0x2c231f,
    platform: 0xe8d5b0,
    hazard: 0xd94f3d,
  },
  // Template themes: tailored for featured game modes.
  gauntlet: {
    background: 0x0d1117,
    backgroundAccent: 0x18202c,
    ground: 0x2a3140,
    platform: 0x9aa7ba,
    movingPlatform: 0x58c7d8,
    hazard: 0xff5c47,
    collectible: 0xffc94d,
    goal: 0x53e8b4,
    player: 0xf3f6ff,
    label: "#e9eefb",
  },
  storm: {
    background: 0x0c1024,
    backgroundAccent: 0x181f3f,
    ground: 0x252a45,
    platform: 0xa9b4dd,
    movingPlatform: 0x7fd4c8,
    hazard: 0xff6a5e,
    collectible: 0xffd66b,
    portal: 0xa78bfa,
    goal: 0x8ce8ff,
    player: 0xf6f4ff,
    label: "#eef0ff",
  },
  quest: {
    background: 0x160f21,
    backgroundAccent: 0x241736,
    ground: 0x3c2b2a,
    platform: 0xe3c88f,
    movingPlatform: 0x8fd4c1,
    bouncePad: 0xf2a6c0,
    hazard: 0xe4574f,
    collectible: 0xffd45e,
    goal: 0x63e6a8,
    player: 0xfaf6ec,
    label: "#f7f0e2",
  },
};

export function paletteForTheme(theme: string): ThemePalette {
  return { ...DEFAULT_PALETTE, ...(PALETTES[theme] ?? {}) };
}

type SpecLike = {
  theme: string;
  magicPatterns?: {
    palette?: Partial<
      Record<
        | "background"
        | "backgroundAccent"
        | "platform"
        | "collectible"
        | "goal"
        | "hazard",
        number
      >
    >;
  };
};

/**
 * Theme palette with per-game accents adapted from the Magic Patterns design
 * generated for this photo. Absent or partial palettes fall back cleanly.
 */
export function paletteForSpec(spec: SpecLike): ThemePalette {
  const base = paletteForTheme(spec.theme);
  const custom = spec.magicPatterns?.palette;
  if (!custom) return base;

  const overrides: Partial<ThemePalette> = {};
  for (const key of [
    "background",
    "backgroundAccent",
    "platform",
    "collectible",
    "goal",
    "hazard",
  ] as const) {
    const value = custom[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      overrides[key] = value;
    }
  }
  return { ...base, ...overrides };
}
