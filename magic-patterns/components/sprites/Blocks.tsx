import React from 'react';
import { SpriteFrame, INK } from './SpriteFrame';
import type { SpriteProps } from '../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Grass-topped ground tile. */
export function GrassBlock({ size, className, label = 'Grass block' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="16" width="56" height="44" rx="4" fill="#92400e" {...S} />
      <path d="M4 28h56" stroke="#78350f" strokeWidth="2" opacity="0.5" />
      <path d="M8 16h48a4 4 0 014 4v8H4v-8a4 4 0 014-4z" fill="#4ade80" {...S} />
      <path d="M12 16c2-4 6-4 8 0M28 16c2-5 7-5 9 0M44 16c2-4 6-4 8 0" fill="#4ade80" {...S} />
      <circle cx="18" cy="42" r="2" fill="#78350f" />
      <circle cx="38" cy="48" r="2.5" fill="#78350f" />
    </SpriteFrame>);

}

/** Plain dirt filler tile. */
export function DirtBlock({ size, className, label = 'Dirt block' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="4" width="56" height="56" rx="4" fill="#92400e" {...S} />
      <circle cx="18" cy="18" r="3" fill="#78350f" />
      <circle cx="42" cy="28" r="2.5" fill="#78350f" />
      <circle cx="24" cy="46" r="3.5" fill="#78350f" />
      <circle cx="48" cy="48" r="2" fill="#78350f" />
    </SpriteFrame>);

}

/** Solid stone tile. */
export function StoneBlock({ size, className, label = 'Stone block' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="4" width="56" height="56" rx="4" fill="#94a3b8" {...S} />
      <path d="M4 24h56M4 42h56M22 4v20M42 24v18M14 42v18M40 42v18" stroke="#64748b" strokeWidth="2" />
    </SpriteFrame>);

}

/** Classic brick tile. */
export function BrickBlock({ size, className, label = 'Brick block' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="4" width="56" height="56" rx="3" fill="#c2410c" {...S} />
      <path d="M4 18h56M4 32h56M4 46h56" stroke="#7c2d12" strokeWidth="2" />
      <path d="M32 4v14M18 18v14M46 18v14M32 32v14M18 46v14M46 46v14" stroke="#7c2d12" strokeWidth="2" />
    </SpriteFrame>);

}

/** Slippery ice tile. */
export function IceBlock({ size, className, label = 'Ice block' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="4" width="56" height="56" rx="4" fill="#a5f3fc" {...S} />
      <path d="M10 40l14-16 10 10 8-8 12 12" fill="none" stroke="#0891b2" strokeWidth="2" />
      <path d="M12 12l8 8M44 14l6 6" stroke="#fff" strokeWidth="4" opacity="0.8" />
    </SpriteFrame>);

}

/** Wooden crate — pushable or breakable. */
export function WoodCrate({ size, className, label = 'Wooden crate' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="6" y="6" width="52" height="52" rx="4" fill="#b45309" {...S} />
      <rect x="12" y="12" width="40" height="40" rx="2" fill="#d97706" {...S} />
      <path d="M12 12l40 40M52 12L12 52" {...S} />
    </SpriteFrame>);

}

/** Reinforced metal crate. */
export function MetalCrate({ size, className, label = 'Metal crate' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="6" y="6" width="52" height="52" rx="4" fill="#64748b" {...S} />
      <rect x="14" y="14" width="36" height="36" rx="3" fill="#94a3b8" {...S} />
      <circle cx="14" cy="14" r="2.5" fill="#334155" />
      <circle cx="50" cy="14" r="2.5" fill="#334155" />
      <circle cx="14" cy="50" r="2.5" fill="#334155" />
      <circle cx="50" cy="50" r="2.5" fill="#334155" />
      <path d="M24 32h16" stroke="#334155" strokeWidth="3" />
    </SpriteFrame>);

}

/** Cracked block that shatters after a hit. */
export function BreakableBlock({ size, className, label = 'Breakable block' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="4" width="56" height="56" rx="4" fill="#a8a29e" {...S} />
      <path d="M20 4l6 18-12 8 14 10-6 20" fill="none" stroke="#57534e" strokeWidth="2.5" />
      <path d="M44 4l-4 16 12 6-10 12 4 22" fill="none" stroke="#57534e" strokeWidth="2.5" />
    </SpriteFrame>);

}

/** Mystery block containing a power-up. */
export function QuestionBlock({ size, className, animated, label = 'Question block' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="4" y="4" width="56" height="56" rx="6" fill="#f59e0b" {...S} />
      <rect x="10" y="10" width="44" height="44" rx="4" fill="#fbbf24" {...S} strokeWidth="1.5" />
      <path
        d="M25 24a7 7 0 1114 0c0 5-7 5-7 10"
        fill="none"
        stroke={INK}
        strokeWidth="5"
        strokeLinecap="round" />
      
      <circle cx="32" cy="45" r="3.5" fill={INK} />
    </SpriteFrame>);

}

/** Floating one-way platform — jump up through it. */
export function OneWayPlatform({ size, className, label = 'One-way platform' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="2" y="26" width="60" height="12" rx="5" fill="#a16207" {...S} />
      <rect x="2" y="26" width="60" height="5" rx="2.5" fill="#ca8a04" />
      <path d="M20 20l6-6 6 6M38 20l6-6 6 6" fill="none" stroke="#22c55e" strokeWidth="2.5" />
      <path d="M12 38v6M52 38v6" {...S} opacity="0.4" />
    </SpriteFrame>);

}

/** Platform that slides along a track. */
export function MovingPlatform({ size, className, animated, label = 'Moving platform' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M4 48h56" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4" />
      <rect x="10" y="26" width="44" height="14" rx="4" fill="#0ea5e9" {...S} />
      <rect x="10" y="26" width="44" height="5" rx="2.5" fill="#38bdf8" />
      <path d="M18 46l-8-6M46 46l8-6" stroke="#38bdf8" strokeWidth="3" />
      <circle cx="16" cy="47" r="3" fill="#334155" {...S} strokeWidth="1.5" />
      <circle cx="48" cy="47" r="3" fill="#334155" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Conveyor belt that pushes the player sideways. */
export function ConveyorBelt({ size, className, animated, label = 'Conveyor belt' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="none" label={label}>
      <rect x="2" y="24" width="60" height="18" rx="9" fill="#334155" {...S} />
      <circle cx="14" cy="33" r="6" fill="#94a3b8" {...S} />
      <circle cx="50" cy="33" r="6" fill="#94a3b8" {...S} />
      <path d="M22 33h20" stroke="#facc15" strokeWidth="3" />
      <path d="M38 27l6 6-6 6" fill="none" stroke="#facc15" strokeWidth="3" />
    </SpriteFrame>);

}

/** Climbable ladder segment. */
export function LadderTile({ size, className, label = 'Ladder' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="14" y="2" width="6" height="60" rx="3" fill="#b45309" {...S} />
      <rect x="44" y="2" width="6" height="60" rx="3" fill="#b45309" {...S} />
      <rect x="18" y="12" width="28" height="5" rx="2" fill="#d97706" {...S} />
      <rect x="18" y="28" width="28" height="5" rx="2" fill="#d97706" {...S} />
      <rect x="18" y="44" width="28" height="5" rx="2" fill="#d97706" {...S} />
    </SpriteFrame>);

}

/** Rope bridge span for gaps. */
export function RopeBridge({ size, className, animated, label = 'Rope bridge' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M2 20C20 46 44 46 62 20" fill="none" {...S} />
      <path d="M2 28C20 54 44 54 62 28" fill="none" {...S} />
      {[8, 18, 28, 38, 48].map((x, i) =>
      <rect
        key={x}
        x={x}
        y={26 + [6, 12, 15, 12, 6][i]}
        width="9"
        height="4"
        rx="2"
        fill="#b45309"
        stroke={INK}
        strokeWidth="1.5" />

      )}
    </SpriteFrame>);

}

/** Cloud platform for sky levels. */
export function CloudPlatform({ size, className, animated, label = 'Cloud platform' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path
        d="M12 42a10 10 0 010-20 12 12 0 0122-6 11 11 0 0116 12 8 8 0 01-4 14z"
        fill="#f8fafc"
        {...S} />
      
      <path d="M14 42h36" stroke="#cbd5e1" strokeWidth="2" />
    </SpriteFrame>);

}

/** Crumbling platform that falls after standing on it. */
export function CrumblingPlatform({ size, className, label = 'Crumbling platform' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="26" width="56" height="14" rx="3" fill="#a8a29e" {...S} />
      <path d="M20 26v14M36 26v14M48 26v14" stroke="#78716c" strokeWidth="2" />
      <path d="M12 44l3 6M30 44l-2 7M52 44l3 6" stroke="#78716c" strokeWidth="2" />
      <circle cx="22" cy="52" r="2" fill="#78716c" />
      <circle cx="42" cy="54" r="1.5" fill="#78716c" />
    </SpriteFrame>);

}