import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Flower — decorative pickup. */
export function FlowerObject({ size, className, animated, label = 'Flower' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M32 32v26" {...S} strokeWidth="3" />
      <path d="M32 44c-8 0-12-6-12-6s10-4 12 6z" fill="#16a34a" {...S} strokeWidth="1.5" />
      {[0, 72, 144, 216, 288].map((a) =>
      <ellipse key={a} cx="32" cy="16" rx="6" ry="10" fill="#f472b6" {...S} transform={`rotate(${a} 32 28)`} />
      )}
      <circle cx="32" cy="28" r="6" fill="#fde047" {...S} />
    </SpriteFrame>);

}

/** Cactus — spiky desert hazard. */
export function CactusObject({ size, className, label = 'Cactus' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="26" y="10" width="12" height="48" rx="6" fill="#16a34a" {...S} />
      <path d="M26 30H18a6 6 0 00-6 6v8" fill="none" stroke="#16a34a" strokeWidth="10" strokeLinecap="round" />
      <path d="M38 24h8a6 6 0 016 6v10" fill="none" stroke="#16a34a" strokeWidth="10" strokeLinecap="round" />
      <path d="M32 18v6M32 34v6M14 40v4M50 34v4" stroke="#052e16" strokeWidth="2" />
    </SpriteFrame>);

}

/** Fallen log — rollable platform. */
export function LogObject({ size, className, label = 'Log' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="24" width="56" height="20" rx="10" fill="#92400e" {...S} />
      <ellipse cx="56" cy="34" rx="6" ry="10" fill="#b45309" {...S} />
      <ellipse cx="56" cy="34" rx="2.5" ry="4" fill="#78350f" />
      <path d="M12 30h30M14 38h26" stroke="#78350f" strokeWidth="2" />
    </SpriteFrame>);

}

/** Tree stump — small step platform. */
export function StumpObject({ size, className, label = 'Tree stump' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M16 26h32v30H16z" fill="#92400e" {...S} />
      <ellipse cx="32" cy="26" rx="16" ry="7" fill="#d97706" {...S} />
      <ellipse cx="32" cy="26" rx="9" ry="4" fill="#b45309" />
      <ellipse cx="32" cy="26" rx="3" ry="1.5" fill="#92400e" />
    </SpriteFrame>);

}

/** Puddle — slows movement. */
export function PuddleObject({ size, className, animated, label = 'Puddle' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M6 44c0-8 12-10 26-10s26 2 26 10-12 10-26 10S6 52 6 44z" fill="#38bdf8" {...S} />
      <path d="M18 42c6-3 12-3 18 0" stroke="#bae6fd" strokeWidth="3" fill="none" />
    </SpriteFrame>);

}

/** Snowman — breakable winter prop. */
export function SnowmanObject({ size, className, animated, label = 'Snowman' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="32" cy="46" r="16" fill="#f8fafc" {...S} />
      <circle cx="32" cy="26" r="11" fill="#f8fafc" {...S} />
      <circle cx="32" cy="10" r="8" fill="#f8fafc" {...S} />
      <circle cx="29" cy="8" r="1.5" fill={INK} />
      <circle cx="35" cy="8" r="1.5" fill={INK} />
      <path d="M32 11l6 2-6 2z" fill="#f97316" {...S} strokeWidth="1" />
      <path d="M21 24L8 18M43 24l13-6" {...S} strokeWidth="3" />
      <circle cx="32" cy="24" r="2" fill={INK} />
      <circle cx="32" cy="44" r="2" fill={INK} />
    </SpriteFrame>);

}

/** Sandcastle — crumbles when touched. */
export function SandcastleObject({ size, className, label = 'Sandcastle' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M8 56V30h8v-6h8v6h16v-6h8v6h8v26z" fill="#fbbf24" {...S} />
      <path d="M26 42h12v14H26z" fill="#f59e0b" {...S} strokeWidth="1.5" />
      <path d="M20 18v6M44 18v6" {...S} strokeWidth="2" />
      <path d="M20 18l8 3-8 3zM44 18l8 3-8 3z" fill="#ef4444" {...S} strokeWidth="1" />
    </SpriteFrame>);

}

/** Seashell — collectible. */
export function SeashellObject({ size, className, animated, label = 'Seashell' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M32 8c14 0 24 18 24 34a70 70 0 01-48 0C8 26 18 8 32 8z" fill="#fbcfe8" {...S} />
      <path d="M32 8v34M20 14c-2 12-4 20-4 26M44 14c2 12 4 20 4 26" fill="none" stroke="#f472b6" strokeWidth="2" />
    </SpriteFrame>);

}

/** Beach ball — bouncy sphere. */
export function BeachBallObject({ size, className, animated, label = 'Beach ball' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="32" cy="32" r="26" fill="#f8fafc" {...S} />
      <path d="M32 6c8 6 8 46 0 52" fill="#ef4444" {...S} strokeWidth="1.5" />
      <path d="M32 6c-8 6-8 46 0 52" fill="#38bdf8" {...S} strokeWidth="1.5" />
      <path d="M6 32c14-6 38-6 52 0" fill="none" {...S} />
      <circle cx="32" cy="32" r="5" fill="#facc15" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Beehive — spawns chasing bees. */
export function BeehiveObject({ size, className, animated, label = 'Beehive' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M32 8c14 0 22 16 22 30a22 18 0 01-44 0C10 24 18 8 32 8z" fill="#f59e0b" {...S} />
      <path d="M14 24h36M12 34h40M14 44h36" stroke="#b45309" strokeWidth="2" />
      <circle cx="32" cy="40" r="6" fill="#78350f" {...S} strokeWidth="1.5" />
      <circle cx="52" cy="14" r="3" fill="#fde047" {...S} strokeWidth="1" />
    </SpriteFrame>);

}

/** Feather — slow-fall pickup. */
export function FeatherObject({ size, className, animated, label = 'Feather' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M48 8c6 18-4 34-20 40-6 2-12 0-14-6 12-4 22-20 34-34z" fill="#a5b4fc" {...S} />
      <path d="M48 8L18 46" {...S} />
      <path d="M18 46l-8 10" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Bird nest with eggs — fragile perch. */
export function NestObject({ size, className, label = 'Nest' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M8 36c0 12 10 20 24 20s24-8 24-20z" fill="#a16207" {...S} />
      <path d="M10 40h44M12 46h40" stroke="#78350f" strokeWidth="2" />
      <ellipse cx="24" cy="34" rx="7" ry="9" fill="#f8fafc" {...S} />
      <ellipse cx="40" cy="34" rx="7" ry="9" fill="#f8fafc" {...S} />
    </SpriteFrame>);

}

/** Lightning bolt — electric hazard / speed power. */
export function LightningObject({ size, className, animated, label = 'Lightning' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M36 2L14 34h14l-6 28 26-34H32l8-26z" fill="#facc15" {...S} />
    </SpriteFrame>);

}

/** Rainbow — bridge across gaps. */
export function RainbowObject({ size, className, animated, label = 'Rainbow' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      {['#ef4444', '#f97316', '#facc15', '#4ade80', '#38bdf8'].map((c, i) =>
      <path key={c} d={`M${6 + i * 5} 50a${26 - i * 5} ${26 - i * 5} 0 01${52 - i * 10} 0`} fill="none" stroke={c} strokeWidth="5" />
      )}
      <path d="M6 50a26 26 0 0152 0" fill="none" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Anthill — spawns small enemies. */
export function AnthillObject({ size, className, label = 'Anthill' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M4 54a28 24 0 0156 0z" fill="#d97706" {...S} />
      <circle cx="32" cy="40" r="6" fill="#78350f" {...S} strokeWidth="1.5" />
      <circle cx="18" cy="50" r="2" fill="#78350f" />
      <circle cx="46" cy="48" r="2" fill="#78350f" />
    </SpriteFrame>);

}

/** Mushroom cluster — natural bounce pads. */
export function MushroomClusterObject({ size, className, animated, label = 'Mushroom cluster' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="14" y="36" width="8" height="18" rx="3" fill="#fef3c7" {...S} />
      <rect x="34" y="30" width="10" height="24" rx="4" fill="#fef3c7" {...S} />
      <path d="M6 36a12 10 0 0124 0z" fill="#ef4444" {...S} />
      <path d="M26 30a13 12 0 0126 0z" fill="#a855f7" {...S} />
      <circle cx="16" cy="31" r="2" fill="#fff" />
      <circle cx="39" cy="24" r="2.5" fill="#fff" />
    </SpriteFrame>);

}
