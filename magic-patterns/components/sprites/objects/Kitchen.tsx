import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Coffee mug — small stackable block. */
export function MugObject({ size, className, animated, label = 'Mug' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M12 22h32v22a10 10 0 01-10 10H22a10 10 0 01-10-10z" fill="#f8fafc" {...S} />
      <path d="M44 26h6a8 8 0 010 16h-6" fill="none" {...S} />
      <path d="M12 22h32v6H12z" fill="#78350f" {...S} strokeWidth="1.5" />
      <path d="M20 14c0-4 4-4 4-8M32 14c0-4 4-4 4-8" stroke="#cbd5e1" strokeWidth="2" fill="none" />
    </SpriteFrame>);

}

/** Kettle — steam jet hazard when boiling. */
export function KettleObject({ size, className, animated, label = 'Kettle' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M14 30h36v18a8 8 0 01-8 8H22a8 8 0 01-8-8z" fill="#94a3b8" {...S} />
      <path d="M50 34l10-6-2 10z" fill="#94a3b8" {...S} />
      <path d="M20 30a12 12 0 0124 0" fill="none" {...S} strokeWidth="3" />
      <path d="M54 22c0-4 4-4 4-8" stroke="#cbd5e1" strokeWidth="3" fill="none" />
      <rect x="26" y="40" width="12" height="8" rx="2" fill="#e2e8f0" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Toaster — launches the player like a bounce pad. */
export function ToasterObject({ size, className, animated, label = 'Toaster' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M20 20l8-10h4v12M36 22V10h4l6 10" fill="#d97706" {...S} />
      <rect x="8" y="22" width="48" height="30" rx="8" fill="#cbd5e1" {...S} />
      <path d="M18 22h12M34 22h12" stroke={INK} strokeWidth="3" />
      <circle cx="46" cy="40" r="4" fill="#ef4444" {...S} strokeWidth="1.5" />
      <path d="M14 36h14" stroke="#64748b" strokeWidth="3" />
    </SpriteFrame>);

}

/** Frying pan — swingable melee / platform. */
export function FryingPanObject({ size, className, label = 'Frying pan' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <ellipse cx="26" cy="36" rx="22" ry="12" fill="#334155" {...S} />
      <ellipse cx="26" cy="34" rx="17" ry="8" fill="#1e293b" />
      <path d="M46 32l14-6" {...S} strokeWidth="6" strokeLinecap="round" />
      <path d="M46 32l14-6" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
    </SpriteFrame>);

}

/** Cooking pot — container / hiding spot. */
export function PotObject({ size, className, label = 'Cooking pot' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="12" y="26" width="40" height="26" rx="6" fill="#64748b" {...S} />
      <rect x="8" y="20" width="48" height="8" rx="4" fill="#94a3b8" {...S} />
      <rect x="28" y="12" width="8" height="8" rx="3" fill="#475569" {...S} />
      <path d="M4 32h8M52 32h8" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Fridge — tall solid block, cold zone. */
export function FridgeObject({ size, className, label = 'Fridge' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="14" y="4" width="36" height="56" rx="5" fill="#e2e8f0" {...S} />
      <path d="M14 24h36" {...S} />
      <path d="M42 10v10M42 30v14" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <rect x="20" y="30" width="8" height="8" rx="2" fill="#fbbf24" {...S} strokeWidth="1.5" />
      <path d="M22 44h10" stroke="#94a3b8" strokeWidth="2" />
    </SpriteFrame>);

}

/** Microwave — timed hazard emitter. */
export function MicrowaveObject({ size, className, animated, label = 'Microwave' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="4" y="18" width="56" height="30" rx="5" fill="#475569" {...S} />
      <rect x="10" y="24" width="34" height="18" rx="3" fill="#1e293b" {...S} strokeWidth="1.5" />
      <circle cx="27" cy="33" r="5" fill="#facc15" opacity="0.7" />
      <rect x="48" y="24" width="8" height="10" rx="2" fill="#94a3b8" {...S} strokeWidth="1.5" />
      <circle cx="52" cy="40" r="3" fill="#ef4444" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Blender — spinning hazard. */
export function BlenderObject({ size, className, animated, label = 'Blender' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M18 6h28l-4 34H22z" fill="#bae6fd" {...S} />
      <path d="M20 24h24" stroke="#38bdf8" strokeWidth="4" />
      <rect x="16" y="40" width="32" height="18" rx="5" fill="#334155" {...S} />
      <circle cx="24" cy="49" r="3" fill="#ef4444" {...S} strokeWidth="1.5" />
      <path d="M34 46h10" stroke="#94a3b8" strokeWidth="3" />
    </SpriteFrame>);

}

/** Plate — thin floating platform. */
export function PlateObject({ size, className, label = 'Plate' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <ellipse cx="32" cy="34" rx="28" ry="10" fill="#f8fafc" {...S} />
      <ellipse cx="32" cy="32" rx="18" ry="6" fill="#e2e8f0" {...S} strokeWidth="1.5" />
      <path d="M4 34c0 6 12 10 28 10s28-4 28-10" fill="none" {...S} />
    </SpriteFrame>);

}

/** Fork — spike hazard when point-up. */
export function ForkObject({ size, className, label = 'Fork' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M22 4v16M32 4v16M42 4v16" {...S} strokeWidth="4" />
      <path d="M18 20h28v6a14 14 0 01-8 12v22h-12V38a14 14 0 01-8-12z" fill="#cbd5e1" {...S} />
    </SpriteFrame>);

}

/** Knife — hazard blade. */
export function KnifeObject({ size, className, label = 'Knife' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M14 44L44 8l6 6-28 34z" fill="#e2e8f0" {...S} />
      <path d="M44 8l6 6" {...S} />
      <rect x="6" y="44" width="16" height="10" rx="3" fill="#78350f" {...S} transform="rotate(-40 14 49)" />
    </SpriteFrame>);

}

/** Rolling pin — rolling hazard. */
export function RollingPinObject({ size, className, animated, label = 'Rolling pin' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <rect x="14" y="24" width="36" height="16" rx="8" fill="#d97706" {...S} />
      <rect x="2" y="29" width="14" height="6" rx="3" fill="#b45309" {...S} />
      <rect x="48" y="29" width="14" height="6" rx="3" fill="#b45309" {...S} />
      <path d="M24 26v12M34 26v12" stroke="#b45309" strokeWidth="2" />
    </SpriteFrame>);

}

/** Glass bottle — breakable object. */
export function BottleObject({ size, className, label = 'Bottle' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M26 6h12v12l6 10v28a6 6 0 01-6 6H26a6 6 0 01-6-6V28l6-10z" fill="#4ade80" {...S} />
      <rect x="24" y="2" width="16" height="6" rx="2" fill="#b45309" {...S} />
      <rect x="22" y="34" width="20" height="14" rx="2" fill="#fef3c7" {...S} strokeWidth="1.5" />
      <path d="M25 22c-2 4-2 6-2 10" stroke="#bbf7d0" strokeWidth="3" fill="none" />
    </SpriteFrame>);

}

/** Soup can — rolling / stacking block. */
export function CanObject({ size, className, label = 'Tin can' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="16" y="12" width="32" height="42" rx="4" fill="#94a3b8" {...S} />
      <ellipse cx="32" cy="12" rx="16" ry="5" fill="#cbd5e1" {...S} />
      <rect x="16" y="24" width="32" height="18" fill="#ef4444" {...S} strokeWidth="1.5" />
      <path d="M22 33h20" stroke="#fff" strokeWidth="3" />
    </SpriteFrame>);

}

/** Cutting board — plank platform. */
export function CuttingBoardObject({ size, className, label = 'Cutting board' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="24" width="48" height="20" rx="4" fill="#d97706" {...S} />
      <path d="M52 28h8a6 6 0 010 12h-8" fill="#d97706" {...S} />
      <circle cx="58" cy="34" r="2" fill={INK} />
      <path d="M12 28v12M22 28v12M32 28v12M42 28v12" stroke="#b45309" strokeWidth="2" />
    </SpriteFrame>);

}

/** Cereal box — light pushable block. */
export function CerealBoxObject({ size, className, label = 'Cereal box' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="16" y="6" width="32" height="52" rx="3" fill="#f59e0b" {...S} />
      <rect x="20" y="14" width="24" height="20" rx="2" fill="#fef3c7" {...S} strokeWidth="1.5" />
      <circle cx="27" cy="24" r="3" fill="#ef4444" />
      <circle cx="36" cy="26" r="3" fill="#22c55e" />
      <path d="M20 42h24M20 48h16" stroke="#b45309" strokeWidth="3" />
    </SpriteFrame>);

}

/** Single-use plastic water bottle — light, clear, falls from the sky. */
export function SingleUseBottleObject({ size, className, animated, label = 'Water bottle' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M20 2h24v26c0 6-3 8-3 14H23c0-6-3-8-3-14z" fill="#bae6fd" {...S} />
      <path d="M20 12h24M20 20h24" stroke="#7dd3fc" strokeWidth="2" />
      <rect x="21" y="26" width="22" height="12" rx="2" fill="#f8fafc" {...S} strokeWidth="1.5" />
      <path d="M25 31h14M27 35h10" stroke="#0ea5e9" strokeWidth="2" />
      <path d="M25 42h14v8H25z" fill="#a5f3fc" {...S} strokeWidth="1.5" />
      <rect x="24" y="50" width="16" height="9" rx="2" fill="#0284c7" {...S} />
      <path d="M27 52v5M31 52v5M35 52v5" stroke="#075985" strokeWidth="1.5" />
      <path d="M32 62c2 0 2-3 0-3s-2 3 0 3z" fill="#38bdf8" {...S} strokeWidth="1" />
    </SpriteFrame>);

}
