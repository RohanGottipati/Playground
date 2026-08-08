import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Sofa — wide soft platform that absorbs fall damage. */
export function SofaObject({ size, className, label = 'Sofa' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="26" width="56" height="20" rx="8" fill="#0d9488" {...S} />
      <rect x="10" y="16" width="44" height="18" rx="6" fill="#14b8a6" {...S} />
      <rect x="4" y="24" width="12" height="20" rx="6" fill="#0f766e" {...S} />
      <rect x="48" y="24" width="12" height="20" rx="6" fill="#0f766e" {...S} />
      <path d="M32 18v14" stroke="#0f766e" strokeWidth="2" />
      <rect x="12" y="46" width="6" height="10" rx="2" fill="#92400e" {...S} />
      <rect x="46" y="46" width="6" height="10" rx="2" fill="#92400e" {...S} />
    </SpriteFrame>);

}

/** Bed — respawn point and bounce surface. */
export function BedObject({ size, className, label = 'Bed' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="20" width="10" height="34" rx="3" fill="#92400e" {...S} />
      <rect x="50" y="30" width="10" height="24" rx="3" fill="#92400e" {...S} />
      <rect x="8" y="36" width="48" height="14" rx="4" fill="#e2e8f0" {...S} />
      <path d="M8 42h48" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="14" y="28" width="18" height="10" rx="4" fill="#f8fafc" {...S} />
      <path d="M32 36h24v6H32z" fill="#60a5fa" {...S} />
    </SpriteFrame>);

}

/** Desk — sturdy elevated platform. */
export function DeskObject({ size, className, label = 'Desk' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="22" width="56" height="8" rx="3" fill="#d97706" {...S} />
      <rect x="8" y="30" width="8" height="28" rx="2" fill="#92400e" {...S} />
      <rect x="36" y="30" width="22" height="18" rx="3" fill="#b45309" {...S} />
      <path d="M36 39h22" stroke="#92400e" strokeWidth="2" />
      <circle cx="47" cy="34" r="1.5" fill={INK} />
      <circle cx="47" cy="44" r="1.5" fill={INK} />
      <rect x="50" y="48" width="8" height="10" rx="2" fill="#92400e" {...S} />
    </SpriteFrame>);

}

/** Bar stool — small one-tile perch. */
export function StoolObject({ size, className, label = 'Stool' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <ellipse cx="32" cy="22" rx="20" ry="7" fill="#ef4444" {...S} />
      <path d="M16 26l-4 30M48 26l4 30M22 28v28M42 28v28" {...S} strokeWidth="3" />
      <path d="M16 44h32" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Wardrobe — tall solid wall block. */
export function WardrobeObject({ size, className, label = 'Wardrobe' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="12" y="4" width="40" height="54" rx="4" fill="#b45309" {...S} />
      <path d="M32 6v50" stroke="#7c2d12" strokeWidth="2" />
      <circle cx="28" cy="32" r="2.5" fill="#facc15" {...S} strokeWidth="1.5" />
      <circle cx="36" cy="32" r="2.5" fill="#facc15" {...S} strokeWidth="1.5" />
      <path d="M16 8h12M36 8h12" stroke="#92400e" strokeWidth="2" />
    </SpriteFrame>);

}

/** Rug — trigger zone or safe pad. */
export function RugObject({ size, className, label = 'Rug' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="30" width="56" height="20" rx="4" fill="#a855f7" {...S} />
      <rect x="12" y="35" width="40" height="10" rx="2" fill="#d8b4fe" {...S} strokeWidth="1.5" />
      <path d="M20 35v10M32 35v10M44 35v10" stroke="#7e22ce" strokeWidth="2" />
      <path d="M4 50v4M14 50v4M24 50v4M34 50v4M44 50v4M56 50v4" {...S} strokeWidth="2" />
    </SpriteFrame>);

}

/** Mirror — reflects projectiles / reveals hidden paths. */
export function MirrorObject({ size, className, animated, label = 'Mirror' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="16" y="4" width="32" height="52" rx="14" fill="#d1d5db" {...S} />
      <rect x="21" y="9" width="22" height="42" rx="10" fill="#bfdbfe" {...S} strokeWidth="1.5" />
      <path d="M26 20l10-6M26 32l14-10" stroke="#fff" strokeWidth="3" />
      <rect x="22" y="56" width="20" height="5" rx="2" fill="#6b7280" {...S} />
    </SpriteFrame>);

}

/** Window — breakable pass-through. */
export function WindowObject({ size, className, label = 'Window' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="8" y="8" width="48" height="48" rx="4" fill="#93c5fd" {...S} />
      <path d="M32 8v48M8 32h48" {...S} strokeWidth="3" />
      <path d="M14 26l10-10M14 44l14-14" stroke="#fff" strokeWidth="3" />
      <rect x="4" y="54" width="56" height="6" rx="2" fill="#b45309" {...S} />
    </SpriteFrame>);

}

/** Interior door — level transition. */
export function DoorObject({ size, className, label = 'Door' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="14" y="4" width="36" height="54" rx="3" fill="#c2410c" {...S} />
      <rect x="20" y="10" width="24" height="18" rx="2" fill="#ea580c" {...S} strokeWidth="1.5" />
      <rect x="20" y="34" width="24" height="18" rx="2" fill="#ea580c" {...S} strokeWidth="1.5" />
      <circle cx="42" cy="32" r="3" fill="#facc15" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Picture frame — decorative wall element / hidden switch. */
export function PictureFrameObject({ size, className, label = 'Picture frame' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="8" y="12" width="48" height="40" rx="4" fill="#a16207" {...S} />
      <rect x="14" y="18" width="36" height="28" rx="2" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <path d="M14 40l10-10 6 6 8-10 12 14z" fill="#4ade80" {...S} strokeWidth="1.5" />
      <circle cx="22" cy="25" r="3" fill="#facc15" />
    </SpriteFrame>);

}

/** Potted plant — soft decor / cover. */
export function PottedPlantObject({ size, className, animated, label = 'Potted plant' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M20 40h24l-4 18H24z" fill="#c2410c" {...S} />
      <path d="M18 36h28v6H18z" fill="#ea580c" {...S} />
      <path d="M32 38V16M32 24c-8 0-12-6-12-6s8-2 12 6zM32 30c8 0 12-6 12-6s-8-2-12 6z" fill="#16a34a" {...S} />
    </SpriteFrame>);

}

/** Curtain — hides secret rooms. */
export function CurtainObject({ size, className, animated, label = 'Curtain' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <rect x="4" y="6" width="56" height="5" rx="2" fill="#57534e" {...S} />
      <path d="M8 11c6 14 0 30 4 46h16c-6-16 0-32-4-46z" fill="#dc2626" {...S} />
      <path d="M56 11c-6 14 0 30-4 46H36c6-16 0-32 4-46z" fill="#dc2626" {...S} />
      <path d="M14 14c4 14 0 28 2 42M50 14c-4 14 0 28-2 42" stroke="#991b1b" strokeWidth="2" />
    </SpriteFrame>);

}

/** Filing cabinet — pushable heavy block. */
export function CabinetObject({ size, className, label = 'Filing cabinet' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="14" y="8" width="36" height="50" rx="4" fill="#64748b" {...S} />
      <rect x="18" y="14" width="28" height="12" rx="2" fill="#94a3b8" {...S} strokeWidth="1.5" />
      <rect x="18" y="30" width="28" height="12" rx="2" fill="#94a3b8" {...S} strokeWidth="1.5" />
      <rect x="18" y="46" width="28" height="8" rx="2" fill="#94a3b8" {...S} strokeWidth="1.5" />
      <path d="M28 20h8M28 36h8" stroke={INK} strokeWidth="3" />
    </SpriteFrame>);

}

/** Ceiling fan — recurring updraft. */
export function CeilingFanObject({ size, className, animated, label = 'Ceiling fan' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <path d="M32 8v14" {...S} strokeWidth="3" />
      <ellipse cx="32" cy="30" rx="8" ry="6" fill="#475569" {...S} />
      <path d="M26 30L4 22l22 2zM38 30l22-8-22 2zM30 36l-6 20 10-18zM36 36l10 18-6-20z" fill="#94a3b8" {...S} />
    </SpriteFrame>);

}

/** Step ladder — climbable traversal object. */
export function StepLadderObject({ size, className, label = 'Step ladder' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M26 8L14 58M32 8l10 50" {...S} strokeWidth="4" />
      <path d="M22 24h12M19 36h17M16 48h22" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
      <path d="M22 24h12M19 36h17M16 48h22" {...S} strokeWidth="1.5" />
      <rect x="24" y="4" width="12" height="6" rx="2" fill="#f59e0b" {...S} />
    </SpriteFrame>);

}
