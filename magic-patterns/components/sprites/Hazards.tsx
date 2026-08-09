import React from 'react';
import { SpriteFrame, INK } from './SpriteFrame';
import type { SpriteProps } from '../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Floor spike strip. */
export function SpikeStrip({ size, className, label = 'Spikes' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M4 48l8-24 8 24 8-24 8 24 8-24 8 24z" fill="#cbd5e1" {...S} />
      <rect x="2" y="46" width="60" height="10" rx="3" fill="#475569" {...S} />
    </SpriteFrame>);

}

/** Bubbling lava pool. */
export function LavaPool({ size, className, animated, label = 'Lava pool' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="2" y="34" width="60" height="24" rx="4" fill="#ea580c" {...S} />
      <path d="M2 38c8-4 12 4 20 0s12 4 20 0 12 4 20 0" fill="none" stroke="#fbbf24" strokeWidth="3" />
      <circle cx="18" cy="48" r="3" fill="#fbbf24" />
      <circle cx="40" cy="50" r="2" fill="#fbbf24" />
      <path d="M28 30c0-4 4-4 4-8" stroke="#fb923c" strokeWidth="2" fill="none" />
    </SpriteFrame>);

}

/** Rotating saw blade. */
export function SawBlade({ size, className, animated, label = 'Saw blade' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <path
        d="M32 2l6 8 9-4 2 10 10 2-5 9 7 7-9 5 2 10-10-1-4 9-8-6-8 6-4-9-10 1 2-10-9-5 7-7-5-9 10-2 2-10 9 4z"
        fill="#cbd5e1"
        {...S} />
      
      <circle cx="32" cy="32" r="12" fill="#94a3b8" {...S} />
      <circle cx="32" cy="32" r="4" fill="#475569" {...S} />
    </SpriteFrame>);

}

/** Wall-mounted flame jet. */
export function FireTrap({ size, className, animated, label = 'Fire trap' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="18" y="48" width="28" height="12" rx="3" fill="#57534e" {...S} />
      <path d="M32 6c8 10 12 14 12 24a12 12 0 01-24 0c0-10 4-14 12-24z" fill="#f97316" {...S} />
      <path d="M32 22c4 6 5 8 5 12a5 5 0 01-10 0c0-4 1-6 5-12z" fill="#fde047" />
    </SpriteFrame>);

}

/** Electric fence / laser barrier. */
export function ElectricFence({ size, className, animated, label = 'Electric barrier' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="6" y="4" width="10" height="10" rx="3" fill="#475569" {...S} />
      <rect x="48" y="4" width="10" height="10" rx="3" fill="#475569" {...S} />
      <rect x="6" y="50" width="10" height="10" rx="3" fill="#475569" {...S} />
      <rect x="48" y="50" width="10" height="10" rx="3" fill="#475569" {...S} />
      <path d="M11 14l6 10-6 8 6 10-6 12" fill="none" stroke="#38bdf8" strokeWidth="3" />
      <path d="M53 14l-6 10 6 8-6 10 6 12" fill="none" stroke="#38bdf8" strokeWidth="3" />
      <path d="M11 22h42M11 40h42" stroke="#7dd3fc" strokeWidth="2" strokeDasharray="3 5" />
    </SpriteFrame>);

}

/** Falling boulder / crusher. */
export function FallingBoulder({ size, className, animated, label = 'Falling boulder' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M32 6l18 10 4 20-14 16H24L10 36l4-20z" fill="#78716c" {...S} />
      <path d="M22 20l10 8-6 12 14 4" fill="none" stroke="#57534e" strokeWidth="2" />
      <path d="M14 58h36" stroke="#57534e" strokeWidth="2" strokeDasharray="4 4" />
    </SpriteFrame>);

}

/** Spike-launching turret. */
export function TurretCannon({ size, className, animated, label = 'Turret' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M10 58l6-16h32l6 16z" fill="#475569" {...S} />
      <circle cx="32" cy="34" r="14" fill="#64748b" {...S} />
      <rect x="30" y="6" width="22" height="12" rx="4" fill="#334155" {...S} transform="rotate(-15 41 12)" />
      <circle cx="32" cy="34" r="5" fill="#f87171" {...S} />
    </SpriteFrame>);

}

/** Explosive barrel. */
export function TntBarrel({ size, className, animated, label = 'Explosive barrel' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="12" y="16" width="40" height="42" rx="6" fill="#dc2626" {...S} />
      <rect x="12" y="26" width="40" height="18" rx="2" fill="#fef3c7" {...S} strokeWidth="1.5" />
      <path d="M20 32h6v6h-6zM30 32h4v6h-4zM38 32h6v6h-6z" fill={INK} />
      <path d="M32 16V8c6 0 6-6 12-6" fill="none" {...S} />
      <circle cx="46" cy="2" r="3" fill="#f59e0b" />
    </SpriteFrame>);

}

/** Toxic acid pit. */
export function AcidPit({ size, className, animated, label = 'Acid pit' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="2" y="34" width="60" height="24" rx="4" fill="#65a30d" {...S} />
      <path d="M2 38c8-4 12 4 20 0s12 4 20 0 12 4 20 0" fill="none" stroke="#a3e635" strokeWidth="3" />
      <circle cx="22" cy="48" r="3" fill="#d9f99d" />
      <circle cx="44" cy="50" r="2" fill="#d9f99d" />
      <path d="M14 28c0-3 3-3 3-6M48 30c0-3 3-3 3-6" stroke="#a3e635" strokeWidth="2" fill="none" />
    </SpriteFrame>);

}

/** Swinging spiked mace on a chain. */
export function SwingingMace({ size, className, animated, label = 'Swinging mace' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <rect x="26" y="0" width="12" height="6" rx="2" fill="#475569" {...S} />
      <path d="M32 6v22" {...S} strokeWidth="3" strokeDasharray="4 3" />
      <circle cx="32" cy="42" r="14" fill="#475569" {...S} />
      <path d="M32 24v6M32 54v6M14 42h6M44 42h6M20 30l4 4M44 54l-4-4M20 54l4-4M44 30l-4 4" {...S} strokeWidth="3" />
      <circle cx="27" cy="37" r="3" fill="#94a3b8" />
    </SpriteFrame>);

}

/** Trapdoor that drops open. */
export function Trapdoor({ size, className, label = 'Trapdoor' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="2" y="28" width="60" height="12" rx="3" fill="#57534e" {...S} />
      <path d="M14 28l-8 18M50 28l8 18" stroke="#b45309" strokeWidth="8" strokeLinecap="round" />
      <path d="M14 28l-8 18M50 28l8 18" {...S} strokeWidth="1.5" />
      <circle cx="20" cy="34" r="2.5" fill="#facc15" {...S} strokeWidth="1.5" />
      <circle cx="44" cy="34" r="2.5" fill="#facc15" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Wind gust / updraft zone. */
export function WindGust({ size, className, animated, label = 'Wind gust' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M6 20h28a8 8 0 10-8-8" fill="none" stroke="#7dd3fc" strokeWidth="3" />
      <path d="M6 34h38a8 8 0 11-8 8" fill="none" stroke="#38bdf8" strokeWidth="3" />
      <path d="M6 48h22a6 6 0 106-6" fill="none" stroke="#bae6fd" strokeWidth="3" />
    </SpriteFrame>);

}