import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Hammer — breaks cracked blocks. */
export function HammerObject({ size, className, label = 'Hammer' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M12 12h28l6 8-6 8H12l-4-8z" fill="#94a3b8" {...S} />
      <path d="M28 28l8 30h-8l-8-30z" fill="#b45309" {...S} />
      <path d="M14 16h18" stroke="#64748b" strokeWidth="2" />
    </SpriteFrame>);

}

/** Screwdriver — unlocks panels. */
export function ScrewdriverObject({ size, className, label = 'Screwdriver' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="24" y="4" width="16" height="24" rx="6" fill="#dc2626" {...S} />
      <rect x="28" y="28" width="8" height="20" rx="2" fill="#cbd5e1" {...S} />
      <path d="M28 48h8l-4 10z" fill="#94a3b8" {...S} />
      <path d="M28 10h8M28 16h8" stroke="#991b1b" strokeWidth="2" />
    </SpriteFrame>);

}

/** Wrench — rotates machinery. */
export function WrenchObject({ size, className, animated, label = 'Wrench' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M44 8a14 14 0 00-16 20L10 46l8 8 18-18a14 14 0 0018-16l-9 9-8-2-2-8z" fill="#94a3b8" {...S} />
      <path d="M16 44l4 4" stroke="#64748b" strokeWidth="2" />
    </SpriteFrame>);

}

/** Handsaw — cuts through wooden platforms. */
export function SawObject({ size, className, label = 'Handsaw' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M8 28h44v10l-4 4-4-4-4 4-4-4-4 4-4-4-4 4-4-4-4 4-4-4z" fill="#cbd5e1" {...S} />
      <path d="M52 24h8a4 4 0 014 4v8a4 4 0 01-4 4h-8z" fill="#b45309" {...S} />
    </SpriteFrame>);

}

/** Power drill — drills through soft blocks. */
export function DrillObject({ size, className, animated, label = 'Power drill' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M8 18h30v16H8z" fill="#f59e0b" {...S} />
      <path d="M38 22h10v8H38z" fill="#94a3b8" {...S} />
      <path d="M48 22l14 4-14 4z" fill="#cbd5e1" {...S} />
      <path d="M12 34h14l-4 22h-8z" fill="#b45309" {...S} />
      <circle cx="18" cy="26" r="3" fill="#fef3c7" />
    </SpriteFrame>);

}

/** Paint bucket — recolours the level palette. */
export function PaintBucketObject({ size, className, label = 'Paint bucket' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M14 24h36l-4 32H18z" fill="#e2e8f0" {...S} />
      <path d="M14 24h36v6H14z" fill="#3b82f6" {...S} strokeWidth="1.5" />
      <path d="M18 22a14 10 0 0128 0" fill="none" {...S} strokeWidth="3" />
      <path d="M22 42h20" stroke="#3b82f6" strokeWidth="4" />
    </SpriteFrame>);

}

/** Paint brush — draws temporary platforms. */
export function PaintBrushObject({ size, className, label = 'Paint brush' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="28" y="4" width="8" height="26" rx="3" fill="#b45309" {...S} />
      <rect x="24" y="30" width="16" height="8" rx="2" fill="#94a3b8" {...S} />
      <path d="M24 38h16l-4 18h-8z" fill="#a855f7" {...S} />
      <path d="M30 50h4" stroke="#7e22ce" strokeWidth="2" />
    </SpriteFrame>);

}

/** Toolbox — container of upgrades. */
export function ToolboxObject({ size, className, label = 'Toolbox' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="8" y="26" width="48" height="28" rx="4" fill="#dc2626" {...S} />
      <path d="M8 38h48" stroke="#991b1b" strokeWidth="3" />
      <path d="M22 26v-8h20v8" fill="none" {...S} strokeWidth="3" />
      <rect x="26" y="34" width="12" height="8" rx="2" fill="#fca5a5" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Tape measure — shows jump distances. */
export function TapeMeasureObject({ size, className, label = 'Tape measure' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="10" y="20" width="34" height="30" rx="8" fill="#facc15" {...S} />
      <circle cx="27" cy="35" r="8" fill="#fef3c7" {...S} strokeWidth="1.5" />
      <path d="M44 30h16v8H44z" fill="#f8fafc" {...S} />
      <path d="M50 30v5M56 30v5" stroke={INK} strokeWidth="2" />
    </SpriteFrame>);

}

/** Broom — sweeps enemies away. */
export function BroomObject({ size, className, animated, label = 'Broom' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M20 4l16 34" {...S} strokeWidth="5" />
      <path d="M30 34l14-6 12 26-16 6z" fill="#f59e0b" {...S} />
      <path d="M34 40l10-4M38 48l10-4" stroke="#b45309" strokeWidth="2" />
    </SpriteFrame>);

}

/** Bucket — carries water, extinguishes fire. */
export function BucketObject({ size, className, label = 'Bucket' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M14 26h36l-5 30H19z" fill="#38bdf8" {...S} />
      <rect x="12" y="22" width="40" height="6" rx="3" fill="#0ea5e9" {...S} />
      <path d="M16 22a16 14 0 0132 0" fill="none" {...S} strokeWidth="3" />
      <path d="M18 40h28" stroke="#0284c7" strokeWidth="3" />
    </SpriteFrame>);

}

/** Watering can — grows vines into ladders. */
export function WateringCanObject({ size, className, label = 'Watering can' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M16 24h28l-4 30H20z" fill="#16a34a" {...S} />
      <path d="M44 28l14-10-2 12-12 6z" fill="#15803d" {...S} />
      <path d="M18 24a12 10 0 0122 0" fill="none" {...S} strokeWidth="3" />
      <path d="M44 22h10" stroke="#38bdf8" strokeWidth="3" />
    </SpriteFrame>);

}

/** Shovel — digs through dirt tiles. */
export function ShovelObject({ size, className, label = 'Shovel' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M30 6h8v30h-8z" fill="#b45309" {...S} />
      <path d="M26 4h16v6H26z" fill="#92400e" {...S} />
      <path d="M22 36h20v10c0 8-6 14-10 14s-10-6-10-14z" fill="#94a3b8" {...S} />
    </SpriteFrame>);

}

/** Flashlight — lights dark caves. */
export function FlashlightObject({ size, className, animated, label = 'Flashlight' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="8" y="26" width="26" height="14" rx="4" fill="#334155" {...S} />
      <path d="M34 22h10v22H34z" fill="#facc15" {...S} />
      <path d="M44 20l18-8v42l-18-8z" fill="#fde047" opacity="0.6" />
      <path d="M14 30h10" stroke="#94a3b8" strokeWidth="3" />
    </SpriteFrame>);

}

/** Rope coil — deployable climbing rope. */
export function RopeCoilObject({ size, className, label = 'Rope coil' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <circle cx="32" cy="32" r="24" fill="none" stroke="#d97706" strokeWidth="6" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="#b45309" strokeWidth="6" />
      <circle cx="32" cy="32" r="24" fill="none" {...S} strokeWidth="1.5" />
      <path d="M52 44l10 10" stroke="#d97706" strokeWidth="6" strokeLinecap="round" />
    </SpriteFrame>);

}

/** Chain — connects moving parts. */
export function ChainObject({ size, className, animated, label = 'Chain' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      {[6, 20, 34, 48].map((y) =>
      <ellipse key={y} cx="32" cy={y + 5} rx="8" ry="6" fill="none" stroke="#94a3b8" strokeWidth="4" />
      )}
      {[6, 20, 34, 48].map((y) =>
      <ellipse key={`o-${y}`} cx="32" cy={y + 5} rx="8" ry="6" fill="none" {...S} strokeWidth="1" />
      )}
    </SpriteFrame>);

}

/** Nail — small spike hazard. */
export function NailObject({ size, className, label = 'Nail' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M18 12h28v6H18z" fill="#94a3b8" {...S} />
      <path d="M28 18h8l-4 40z" fill="#cbd5e1" {...S} />
    </SpriteFrame>);

}

/** Plunger — sticks to walls for climbing. */
export function PlungerObject({ size, className, label = 'Plunger' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="28" y="4" width="8" height="30" rx="3" fill="#b45309" {...S} />
      <path d="M14 34h36c0 12-8 20-18 20s-18-8-18-20z" fill="#dc2626" {...S} />
      <path d="M20 42h24" stroke="#991b1b" strokeWidth="3" />
    </SpriteFrame>);

}
