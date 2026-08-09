/**
 * The campaign's five difficulty tiers. The arcade is ordered by these, and
 * their colour ramp is the visual signal that the scroll is getting harder.
 */
export type DifficultyTier = {
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  /** Heading shown above the tier's block of arcade cards. */
  sectionTitle: string;
  blurb: string;
  /** Tailwind classes, kept as literals so the JIT compiler can see them. */
  text: string;
  bg: string;
  border: string;
  glow: string;
  rail: string;
};

export const DIFFICULTY_TIERS: Record<number, DifficultyTier> = {
  1: {
    level: 1,
    label: "Gentle",
    sectionTitle: "Warm-up",
    blurb: "No hazards, no clock pressure. Learn the controls.",
    text: "text-screen",
    bg: "bg-screen",
    border: "border-screen/60",
    glow: "shadow-[0_0_0_3px_rgba(124,231,200,0.16)]",
    rail: "from-screen to-screen/40",
  },
  2: {
    level: 2,
    label: "Easy",
    sectionTitle: "Getting warmer",
    blurb: "First hazards appear. Still forgiving.",
    text: "text-token",
    bg: "bg-token",
    border: "border-token/60",
    glow: "shadow-[0_0_0_3px_rgba(255,207,92,0.16)]",
    rail: "from-token to-token/40",
  },
  3: {
    level: 3,
    label: "Tricky",
    sectionTitle: "Now it bites",
    blurb: "Moving platforms, real timing, tighter clocks.",
    text: "text-[#ffa14a]",
    bg: "bg-[#ffa14a]",
    border: "border-[#ffa14a]/60",
    glow: "shadow-[0_0_0_3px_rgba(255,161,74,0.18)]",
    rail: "from-[#ffa14a] to-[#ffa14a]/40",
  },
  4: {
    level: 4,
    label: "Hard",
    sectionTitle: "Serious business",
    blurb: "Near-limit jumps and routes you have to plan.",
    text: "text-marquee",
    bg: "bg-marquee",
    border: "border-marquee/70",
    glow: "shadow-[0_0_0_3px_rgba(255,93,115,0.2)]",
    rail: "from-marquee to-marquee/40",
  },
  5: {
    level: 5,
    label: "Brutal",
    sectionTitle: "Brutal",
    blurb: "The arcade's final exam. Expect to lose a lot.",
    text: "text-marqueeDeep",
    bg: "bg-marqueeDeep",
    border: "border-marqueeDeep",
    glow: "shadow-[0_0_0_3px_rgba(198,43,71,0.24)]",
    rail: "from-marqueeDeep to-marqueeDeep/40",
  },
};

export function tierFor(difficulty: number): DifficultyTier {
  return DIFFICULTY_TIERS[Math.min(5, Math.max(1, Math.round(difficulty)))];
}

export const MODE_META: Record<
  string,
  { label: string; icon: string; accent: string; chip: string }
> = {
  classic: {
    label: "Platformer",
    icon: "🕹",
    accent: "from-cable to-cable/30",
    chip: "bg-cable text-paper",
  },
  shooter: {
    label: "Shooter",
    icon: "🎯",
    accent: "from-marquee to-marquee/30",
    chip: "bg-marquee text-paper",
  },
  skyfall: {
    label: "Skyfall",
    icon: "☄",
    accent: "from-screen to-screen/30",
    chip: "bg-screen text-ink",
  },
  rush: {
    label: "Rush",
    icon: "⏳",
    accent: "from-token to-token/30",
    chip: "bg-token text-ink",
  },
  gauntlet: {
    label: "Gauntlet",
    icon: "🚀",
    accent: "from-marqueeDeep to-marqueeDeep/30",
    chip: "bg-marqueeDeep text-paper",
  },
};

export function modeMeta(mode: string) {
  return MODE_META[mode] ?? MODE_META.classic;
}
