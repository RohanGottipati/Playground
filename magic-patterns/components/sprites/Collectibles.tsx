import React from 'react';
import { SpriteFrame, INK } from './SpriteFrame';
import type { SpriteProps } from '../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Standard coin pickup. */
export function CoinPickup({ size, className, animated, label = 'Coin' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="32" cy="32" r="22" fill="#f59e0b" {...S} />
      <circle cx="32" cy="32" r="16" fill="#fbbf24" {...S} strokeWidth="1.5" />
      <path d="M32 20v24M26 24h8a5 5 0 010 10h-6a5 5 0 000 10h8" fill="none" stroke="#b45309" strokeWidth="3" />
      <path d="M22 22a12 12 0 016-5" stroke="#fef3c7" strokeWidth="3" fill="none" />
    </SpriteFrame>);

}

/** Rare gem pickup. */
export function GemPickup({ size, className, animated, label = 'Gem' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M20 12h24l14 16-26 26L6 28z" fill="#22d3ee" {...S} />
      <path d="M20 12l12 16 12-16M6 28h52M32 28v26" fill="none" stroke="#0e7490" strokeWidth="2" />
      <path d="M22 18l4 8" stroke="#cffafe" strokeWidth="3" />
    </SpriteFrame>);

}

/** Bonus star. */
export function StarPickup({ size, className, animated, label = 'Star' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <path d="M32 4l8 18 20 2-15 14 4 20-17-10-17 10 4-20L4 24l20-2z" fill="#facc15" {...S} />
      <circle cx="27" cy="28" r="2" fill={INK} />
      <circle cx="37" cy="28" r="2" fill={INK} />
      <path d="M28 34c2 2 6 2 8 0" fill="none" {...S} />
    </SpriteFrame>);

}

/** Health heart pickup. */
export function HeartPickup({ size, className, animated, label = 'Heart' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path
        d="M32 56S6 40 6 24A14 14 0 0132 16 14 14 0 0158 24c0 16-26 32-26 32z"
        fill="#ef4444"
        {...S} />
      
      <path d="M18 22a8 8 0 016-6" stroke="#fecaca" strokeWidth="4" fill="none" />
    </SpriteFrame>);

}

/** Door key pickup. */
export function KeyPickup({ size, className, animated, label = 'Key' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="20" cy="26" r="13" fill="none" stroke="#f59e0b" strokeWidth="6" />
      <circle cx="20" cy="26" r="13" fill="none" {...S} strokeWidth="1.5" />
      <path d="M28 34l22 22" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 52l6-6M46 58l6-6" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
    </SpriteFrame>);

}

/** Treasure chest. */
export function TreasureChest({ size, className, animated, label = 'Treasure chest' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M8 26a24 14 0 0148 0v6H8z" fill="#b45309" {...S} />
      <rect x="8" y="32" width="48" height="24" rx="4" fill="#d97706" {...S} />
      <path d="M8 40h48" stroke="#92400e" strokeWidth="3" />
      <rect x="27" y="34" width="10" height="14" rx="2" fill="#facc15" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="41" r="2" fill={INK} />
    </SpriteFrame>);

}

/** Health potion. */
export function PotionPickup({ size, className, animated, label = 'Potion' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M26 6h12v12l10 18a14 14 0 01-32 0l10-18z" fill="#e2e8f0" {...S} />
      <path d="M20 34a14 14 0 0024 4 14 14 0 01-24-4z" fill="#ef4444" />
      <path d="M18 38a14 14 0 0028 0 14 14 0 01-28 0z" fill="#ef4444" />
      <path d="M18 36c8-6 20 6 28 0a14 14 0 01-28 0z" fill="#ef4444" {...S} strokeWidth="1.5" />
      <rect x="24" y="2" width="16" height="6" rx="2" fill="#a16207" {...S} />
    </SpriteFrame>);

}

/** Power-up mushroom. */
export function PowerMushroom({ size, className, animated, label = 'Power-up mushroom' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="22" y="34" width="20" height="22" rx="6" fill="#fef3c7" {...S} />
      <path d="M4 36a28 22 0 0156 0z" fill="#ef4444" {...S} />
      <circle cx="18" cy="26" r="6" fill="#fef3c7" {...S} strokeWidth="1.5" />
      <circle cx="44" cy="24" r="7" fill="#fef3c7" {...S} strokeWidth="1.5" />
      <circle cx="27" cy="44" r="2" fill={INK} />
      <circle cx="37" cy="44" r="2" fill={INK} />
    </SpriteFrame>);

}

/** Temporary shield power-up. */
export function ShieldPickup({ size, className, animated, label = 'Shield' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M32 4l22 8v20c0 14-10 24-22 28C20 56 10 46 10 32V12z" fill="#38bdf8" {...S} />
      <path d="M32 12l14 5v14c0 9-6 16-14 19-8-3-14-10-14-19V17z" fill="#e0f2fe" {...S} strokeWidth="1.5" />
      <path d="M24 32l6 6 12-12" fill="none" stroke="#0284c7" strokeWidth="4" />
    </SpriteFrame>);

}

/** Speed boots power-up. */
export function SpeedBoots({ size, className, animated, label = 'Speed boots' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M22 10h14v26h14a8 8 0 018 8v8H22z" fill="#7c3aed" {...S} />
      <rect x="18" y="52" width="44" height="8" rx="3" fill="#4c1d95" {...S} />
      <path d="M4 20h12M2 32h14M6 44h10" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 26l-6 10h8l-6 10" fill="none" stroke="#facc15" strokeWidth="3" />
    </SpriteFrame>);

}

/** Magnet that attracts nearby coins. */
export function MagnetPickup({ size, className, animated, label = 'Coin magnet' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M14 54V30a18 18 0 0136 0v24H38V30a6 6 0 00-12 0v24z" fill="#ef4444" {...S} />
      <rect x="14" y="44" width="12" height="10" fill="#e2e8f0" {...S} strokeWidth="1.5" />
      <rect x="38" y="44" width="12" height="10" fill="#e2e8f0" {...S} strokeWidth="1.5" />
      <path d="M20 14l-6-8M44 14l6-8M32 8V2" stroke="#facc15" strokeWidth="3" />
    </SpriteFrame>);

}

/** Time bonus clock. */
export function TimeBonus({ size, className, animated, label = 'Time bonus' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="32" cy="34" r="24" fill="#e2e8f0" {...S} />
      <circle cx="32" cy="34" r="18" fill="#f8fafc" {...S} strokeWidth="1.5" />
      <path d="M32 22v12l9 6" fill="none" {...S} strokeWidth="3" />
      <rect x="26" y="2" width="12" height="8" rx="3" fill="#64748b" {...S} />
      <path d="M32 10v4" {...S} />
      <path d="M50 16l6-6M14 16l-6-6" stroke="#64748b" strokeWidth="3" />
    </SpriteFrame>);

}

/** Energy cell / battery pickup. */
export function BatteryCell({ size, className, animated, label = 'Battery' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="16" y="12" width="32" height="46" rx="6" fill="#334155" {...S} />
      <rect x="26" y="4" width="12" height="8" rx="3" fill="#475569" {...S} />
      <rect x="22" y="20" width="20" height="32" rx="3" fill="#22c55e" {...S} strokeWidth="1.5" />
      <path d="M34 24l-8 12h8l-6 12" fill="none" stroke="#fef08a" strokeWidth="3" />
    </SpriteFrame>);

}

/** Ammo pack pickup. */
export function AmmoPack({ size, className, animated, label = 'Ammo pack' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="8" y="24" width="48" height="30" rx="5" fill="#4d7c0f" {...S} />
      <rect x="8" y="32" width="48" height="6" fill="#3f6212" />
      <rect x="20" y="14" width="8" height="12" rx="3" fill="#facc15" {...S} />
      <rect x="36" y="14" width="8" height="12" rx="3" fill="#facc15" {...S} />
      <path d="M24 44h16" stroke="#a3e635" strokeWidth="3" />
    </SpriteFrame>);

}

/** Mechanic-discovery badge sticker. */
export function DiscoveryBadge({ size, className, animated, label = 'Discovery badge' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path
        d="M32 2l7 6 9-2 3 9 9 4-4 9 4 9-9 4-3 9-9-2-7 6-7-6-9 2-3-9-9-4 4-9-4-9 9-4 3-9 9 2z"
        fill="#f472b6"
        {...S} />
      
      <circle cx="32" cy="32" r="14" fill="#fce7f3" {...S} strokeWidth="1.5" />
      <path d="M24 32l6 6 11-12" fill="none" stroke="#be185d" strokeWidth="4" />
    </SpriteFrame>);

}