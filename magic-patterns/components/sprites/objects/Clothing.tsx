import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** T-shirt — cosmetic skin pickup. */
export function TshirtObject({ size, className, animated, label = 'T-shirt' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M22 10h20l16 10-8 10-6-4v30H20V26l-6 4-8-10z" fill="#3b82f6" {...S} />
      <path d="M24 10a8 6 0 0016 0" fill="none" {...S} />
      <circle cx="32" cy="34" r="7" fill="#fde047" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Cap — cosmetic headwear. */
export function CapObject({ size, className, animated, label = 'Cap' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M12 40a20 20 0 0140 0z" fill="#dc2626" {...S} />
      <path d="M12 40h44a6 6 0 016 6H12z" fill="#991b1b" {...S} />
      <circle cx="32" cy="20" r="3" fill="#fca5a5" {...S} strokeWidth="1.5" />
      <path d="M32 22v18" stroke="#991b1b" strokeWidth="2" />
    </SpriteFrame>);

}

/** Trainer — speed cosmetic. */
export function SneakerObject({ size, className, animated, label = 'Trainer' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M8 44V26h12l10 8h18a10 10 0 0110 10v6H8z" fill="#f8fafc" {...S} />
      <path d="M6 50h52v6H6z" fill="#334155" {...S} />
      <path d="M22 34l6-4M28 40l6-4" stroke="#94a3b8" strokeWidth="2" />
      <path d="M40 42h14" stroke="#ef4444" strokeWidth="3" />
    </SpriteFrame>);

}

/** Boot — heavy stomp ability. */
export function BootObject({ size, className, label = 'Boot' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M20 6h16v28h12a10 10 0 0110 10v8H20z" fill="#78350f" {...S} />
      <rect x="16" y="52" width="46" height="8" rx="3" fill="#451a03" {...S} />
      <path d="M22 16h12M22 24h12" stroke="#92400e" strokeWidth="2" />
    </SpriteFrame>);

}

/** Sock — light floaty object. */
export function SockObject({ size, className, animated, label = 'Sock' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M22 6h16v26c0 8 14 6 14 16s-8 12-14 12-14-4-14-14z" fill="#f472b6" {...S} />
      <path d="M22 14h16" stroke="#be185d" strokeWidth="3" />
      <path d="M22 20h16" stroke="#be185d" strokeWidth="3" />
    </SpriteFrame>);

}

/** Glove — grab ability pickup. */
export function GloveObject({ size, className, animated, label = 'Glove' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M18 24V12a4 4 0 018 0v10h4V8a4 4 0 018 0v14h4v-8a4 4 0 018 0v26a16 16 0 01-16 16H30a16 16 0 01-16-16V22a4 4 0 018 0z" fill="#facc15" {...S} />
      <path d="M22 44h22" stroke="#b45309" strokeWidth="3" />
    </SpriteFrame>);

}

/** Scarf — glider-adjacent cosmetic. */
export function ScarfObject({ size, className, animated, label = 'Scarf' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M10 18c14-8 30-8 44 0-4 8-6 10-6 10s-16-6-32 0z" fill="#dc2626" {...S} />
      <path d="M18 26c0 12 2 20 6 30h10c-4-12-6-20-6-30z" fill="#dc2626" {...S} />
      <path d="M22 40h8M24 50h8" stroke="#fca5a5" strokeWidth="3" />
    </SpriteFrame>);

}

/** Jacket — armour cosmetic. */
export function JacketObject({ size, className, label = 'Jacket' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M22 10h20l14 10-6 10-4-3v29H20V27l-4 3-6-10z" fill="#334155" {...S} />
      <path d="M32 14v42" stroke="#94a3b8" strokeWidth="3" strokeDasharray="4 3" />
      <path d="M22 10l10 8 10-8" fill="none" {...S} />
    </SpriteFrame>);

}

/** Sunglasses — reveals hidden platforms. */
export function SunglassesObject({ size, className, animated, label = 'Sunglasses' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M4 26h24v12a8 8 0 01-16 0z" fill="#1f2937" {...S} />
      <path d="M36 26h24v12a8 8 0 01-16 0z" fill="#1f2937" {...S} />
      <path d="M28 30h8" {...S} strokeWidth="3" />
      <path d="M4 26l-2-6M60 26l2-6" {...S} strokeWidth="3" />
      <path d="M8 30h8" stroke="#64748b" strokeWidth="3" />
    </SpriteFrame>);

}

/** Wristwatch — slow-motion power-up. */
export function WatchObject({ size, className, animated, label = 'Wristwatch' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="24" y="4" width="16" height="18" rx="4" fill="#334155" {...S} />
      <rect x="24" y="42" width="16" height="18" rx="4" fill="#334155" {...S} />
      <rect x="16" y="20" width="32" height="24" rx="6" fill="#cbd5e1" {...S} />
      <circle cx="32" cy="32" r="8" fill="#f8fafc" {...S} strokeWidth="1.5" />
      <path d="M32 32v-5M32 32l4 3" {...S} strokeWidth="2" />
    </SpriteFrame>);

}

/** Coat hanger — hook / zip point. */
export function HangerObject({ size, className, animated, label = 'Coat hanger' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M32 22V16a6 6 0 116 6" fill="none" {...S} strokeWidth="3" />
      <path d="M32 22L8 44h48z" fill="none" {...S} strokeWidth="3" />
      <path d="M8 44h48" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Top hat — collectible cosmetic. */
export function TopHatObject({ size, className, animated, label = 'Top hat' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="20" y="6" width="24" height="34" rx="3" fill="#1f2937" {...S} />
      <rect x="20" y="28" width="24" height="8" fill="#dc2626" {...S} strokeWidth="1.5" />
      <ellipse cx="32" cy="42" rx="26" ry="7" fill="#111827" {...S} />
    </SpriteFrame>);

}

/** Backpack strap belt — utility pickup. */
export function BeltObject({ size, className, label = 'Belt' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="2" y="26" width="60" height="14" rx="4" fill="#78350f" {...S} />
      <rect x="24" y="22" width="18" height="22" rx="4" fill="#facc15" {...S} />
      <rect x="30" y="28" width="6" height="10" rx="2" fill="#78350f" {...S} strokeWidth="1.5" />
      <circle cx="12" cy="33" r="2" fill={INK} />
      <circle cx="52" cy="33" r="2" fill={INK} />
    </SpriteFrame>);

}

/** Swim ring — floats on water. */
export function SwimRingObject({ size, className, animated, label = 'Swim ring' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <circle cx="32" cy="32" r="26" fill="#f8fafc" {...S} />
      <path d="M32 6a26 26 0 0118 8l-8 8a14 14 0 00-10-4z" fill="#ef4444" {...S} strokeWidth="1.5" />
      <path d="M32 58a26 26 0 01-18-8l8-8a14 14 0 0010 4z" fill="#ef4444" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="32" r="12" fill="#bae6fd" {...S} />
    </SpriteFrame>);

}

/** Flip flop — light beach prop. */
export function FlipFlopObject({ size, className, label = 'Flip flop' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M32 6c12 0 16 10 16 24s-4 28-16 28-16-14-16-28S20 6 32 6z" fill="#38bdf8" {...S} />
      <path d="M32 26L22 14M32 26l10-12" fill="none" stroke="#f8fafc" strokeWidth="4" />
      <circle cx="32" cy="27" r="3" fill="#f8fafc" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}
