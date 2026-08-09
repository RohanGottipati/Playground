import React from 'react';
import { SpriteFrame, INK } from './SpriteFrame';
import type { SpriteProps } from '../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Default playable hero — idle pose. */
export function HeroSprite({ size, className, animated, label = 'Hero character' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <ellipse cx="32" cy="60" rx="14" ry="3" fill={INK} opacity="0.15" />
      <rect x="22" y="30" width="20" height="20" rx="5" fill="#3b82f6" {...S} />
      <rect x="16" y="34" width="8" height="5" rx="2.5" fill="#f4c9a8" {...S} />
      <rect x="40" y="34" width="8" height="5" rx="2.5" fill="#f4c9a8" {...S} />
      <rect x="24" y="49" width="6" height="9" rx="2" fill="#1f2a44" {...S} />
      <rect x="34" y="49" width="6" height="9" rx="2" fill="#1f2a44" {...S} />
      <circle cx="32" cy="20" r="12" fill="#f4c9a8" {...S} />
      <path d="M20 17c2-8 8-11 12-11s10 3 12 11c-6-3-18-3-24 0z" fill="#7c3f1d" {...S} />
      <circle cx="27" cy="21" r="2" fill={INK} />
      <circle cx="37" cy="21" r="2" fill={INK} />
      <path d="M28 26c2 2 6 2 8 0" fill="none" {...S} />
    </SpriteFrame>);

}

/** Hero mid-run frame, useful for animation previews. */
export function HeroRunSprite({ size, className, animated, label = 'Hero running' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <ellipse cx="32" cy="60" rx="14" ry="3" fill={INK} opacity="0.15" />
      <path d="M12 44c4 2 6 3 9 2" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.8" />
      <rect x="23" y="30" width="20" height="19" rx="5" fill="#3b82f6" {...S} />
      <rect x="41" y="28" width="9" height="5" rx="2.5" fill="#f4c9a8" {...S} transform="rotate(-25 45 30)" />
      <rect x="15" y="38" width="9" height="5" rx="2.5" fill="#f4c9a8" {...S} transform="rotate(20 19 40)" />
      <rect x="22" y="48" width="7" height="10" rx="2" fill="#1f2a44" {...S} transform="rotate(18 25 53)" />
      <rect x="36" y="48" width="7" height="10" rx="2" fill="#1f2a44" {...S} transform="rotate(-20 39 53)" />
      <circle cx="34" cy="20" r="12" fill="#f4c9a8" {...S} />
      <path d="M22 17c2-8 8-11 12-11s10 3 12 11c-6-3-18-3-24 0z" fill="#7c3f1d" {...S} />
      <circle cx="38" cy="20" r="2" fill={INK} />
      <path d="M32 26c3 2 6 1 7-1" fill="none" {...S} />
    </SpriteFrame>);

}

/** Hero jump / airborne frame. */
export function HeroJumpSprite({ size, className, animated, label = 'Hero jumping' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <ellipse cx="32" cy="61" rx="8" ry="2" fill={INK} opacity="0.1" />
      <rect x="23" y="28" width="20" height="19" rx="5" fill="#3b82f6" {...S} />
      <rect x="12" y="22" width="9" height="5" rx="2.5" fill="#f4c9a8" {...S} transform="rotate(-45 16 24)" />
      <rect x="44" y="22" width="9" height="5" rx="2.5" fill="#f4c9a8" {...S} transform="rotate(45 48 24)" />
      <rect x="23" y="45" width="7" height="9" rx="2" fill="#1f2a44" {...S} transform="rotate(25 26 49)" />
      <rect x="35" y="45" width="7" height="9" rx="2" fill="#1f2a44" {...S} transform="rotate(-8 38 49)" />
      <circle cx="32" cy="18" r="12" fill="#f4c9a8" {...S} />
      <path d="M20 15c2-8 8-11 12-11s10 3 12 11c-6-3-18-3-24 0z" fill="#7c3f1d" {...S} />
      <circle cx="27" cy="19" r="2" fill={INK} />
      <circle cx="37" cy="19" r="2" fill={INK} />
      <ellipse cx="32" cy="25" rx="3" ry="4" fill={INK} />
    </SpriteFrame>);

}

/** Agile ninja alt-skin. */
export function NinjaSprite({ size, className, animated, label = 'Ninja character' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <ellipse cx="32" cy="60" rx="13" ry="3" fill={INK} opacity="0.15" />
      <rect x="23" y="30" width="18" height="20" rx="5" fill="#334155" {...S} />
      <path d="M23 38h18" stroke="#ef4444" strokeWidth="3" />
      <rect x="24" y="49" width="6" height="9" rx="2" fill="#1e293b" {...S} />
      <rect x="34" y="49" width="6" height="9" rx="2" fill="#1e293b" {...S} />
      <circle cx="32" cy="20" r="12" fill="#334155" {...S} />
      <path d="M20 20h24" stroke="#f4c9a8" strokeWidth="7" />
      <circle cx="27" cy="20" r="1.8" fill={INK} />
      <circle cx="37" cy="20" r="1.8" fill={INK} />
      <path d="M44 12l10-4-6 9" fill="#ef4444" {...S} />
    </SpriteFrame>);

}

/** Robot / mech playable skin. */
export function RobotSprite({ size, className, animated, label = 'Robot character' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <ellipse cx="32" cy="60" rx="14" ry="3" fill={INK} opacity="0.15" />
      <rect x="21" y="28" width="22" height="22" rx="4" fill="#94a3b8" {...S} />
      <rect x="26" y="34" width="12" height="8" rx="2" fill="#22d3ee" {...S} />
      <rect x="14" y="32" width="7" height="6" rx="2" fill="#64748b" {...S} />
      <rect x="43" y="32" width="7" height="6" rx="2" fill="#64748b" {...S} />
      <rect x="24" y="49" width="7" height="9" rx="2" fill="#64748b" {...S} />
      <rect x="33" y="49" width="7" height="9" rx="2" fill="#64748b" {...S} />
      <rect x="22" y="10" width="20" height="16" rx="5" fill="#cbd5e1" {...S} />
      <circle cx="28" cy="18" r="2.5" fill="#22d3ee" {...S} strokeWidth="1.5" />
      <circle cx="36" cy="18" r="2.5" fill="#22d3ee" {...S} strokeWidth="1.5" />
      <path d="M32 10V4" {...S} />
      <circle cx="32" cy="3" r="2.5" fill="#ef4444" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Knight with sword and shield. */
export function KnightSprite({ size, className, animated, label = 'Knight character' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <ellipse cx="32" cy="60" rx="14" ry="3" fill={INK} opacity="0.15" />
      <rect x="23" y="29" width="19" height="21" rx="5" fill="#cbd5e1" {...S} />
      <path d="M32 32v14" stroke="#ef4444" strokeWidth="3" />
      <rect x="25" y="49" width="6" height="9" rx="2" fill="#475569" {...S} />
      <rect x="35" y="49" width="6" height="9" rx="2" fill="#475569" {...S} />
      <path d="M12 30h12v14H12z" fill="#f59e0b" {...S} />
      <path d="M48 44V16l4-4 4 4v28" fill="#e2e8f0" {...S} />
      <circle cx="32" cy="19" r="11" fill="#cbd5e1" {...S} />
      <rect x="25" y="16" width="14" height="5" rx="2" fill={INK} />
      <path d="M26 8h12l-2 4H28z" fill="#ef4444" {...S} />
    </SpriteFrame>);

}

/** Wizard with staff, good for ability demos. */
export function WizardSprite({ size, className, animated, label = 'Wizard character' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <ellipse cx="32" cy="60" rx="14" ry="3" fill={INK} opacity="0.15" />
      <path d="M22 58l4-24h12l4 24z" fill="#6d28d9" {...S} />
      <circle cx="32" cy="24" r="11" fill="#f4c9a8" {...S} />
      <path d="M20 22c0-10 5-16 12-16s12 6 12 16z" fill="#7c3aed" {...S} />
      <path d="M16 22h32" {...S} />
      <circle cx="28" cy="25" r="1.8" fill={INK} />
      <circle cx="36" cy="25" r="1.8" fill={INK} />
      <path d="M26 32c3 4 9 4 12 0" fill="#e5e7eb" {...S} />
      <path d="M48 58V22" {...S} strokeWidth="3" />
      <circle cx="48" cy="18" r="5" fill="#22d3ee" {...S} />
    </SpriteFrame>);

}

/** Bouncing slime enemy. */
export function SlimeSprite({ size, className, animated, label = 'Slime enemy' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <ellipse cx="32" cy="58" rx="18" ry="3" fill={INK} opacity="0.15" />
      <path d="M10 56c0-16 8-26 22-26s22 10 22 26z" fill="#4ade80" {...S} />
      <path d="M10 56h44" {...S} />
      <ellipse cx="24" cy="42" rx="3" ry="4" fill={INK} />
      <ellipse cx="40" cy="42" rx="3" ry="4" fill={INK} />
      <path d="M28 50c2 2 6 2 8 0" fill="none" {...S} />
      <ellipse cx="20" cy="38" rx="4" ry="3" fill="#fff" opacity="0.5" />
    </SpriteFrame>);

}

/** Flying bat enemy. */
export function BatSprite({ size, className, animated, label = 'Bat enemy' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M30 30C22 20 12 20 4 26c6 2 8 8 8 14 6-2 12-4 18-4z" fill="#4c1d95" {...S} />
      <path d="M34 30c8-10 18-10 26-4-6 2-8 8-8 14-6-2-12-4-18-4z" fill="#4c1d95" {...S} />
      <ellipse cx="32" cy="34" rx="10" ry="11" fill="#6d28d9" {...S} />
      <path d="M25 24l-2-8 8 5zM39 24l2-8-8 5z" fill="#6d28d9" {...S} />
      <circle cx="28" cy="32" r="2" fill="#fbbf24" />
      <circle cx="36" cy="32" r="2" fill="#fbbf24" />
      <path d="M28 40l2 3 2-3 2 3 2-3" fill="none" {...S} />
    </SpriteFrame>);

}

/** Ghost enemy that phases through walls. */
export function GhostSprite({ size, className, animated, label = 'Ghost enemy' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M12 52V30a20 20 0 0140 0v22l-7-6-6 6-7-6-6 6z" fill="#e0e7ff" {...S} />
      <circle cx="25" cy="28" r="3.5" fill={INK} />
      <circle cx="39" cy="28" r="3.5" fill={INK} />
      <ellipse cx="32" cy="38" rx="4" ry="5" fill={INK} />
      <circle cx="19" cy="35" r="3" fill="#c7d2fe" />
      <circle cx="45" cy="35" r="3" fill="#c7d2fe" />
    </SpriteFrame>);

}

/** Ceiling spider enemy on a thread. */
export function SpiderSprite({ size, className, animated, label = 'Spider enemy' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M32 0v20" {...S} strokeWidth="1.5" />
      <path d="M20 32c-6-2-10-6-12-12M44 32c6-2 10-6 12-12M20 40c-6 2-10 6-12 12M44 40c6 2 10 6 12 12" fill="none" {...S} />
      <ellipse cx="32" cy="38" rx="16" ry="14" fill="#1f2937" {...S} />
      <circle cx="32" cy="24" r="8" fill="#111827" {...S} />
      <circle cx="29" cy="23" r="2" fill="#f87171" />
      <circle cx="35" cy="23" r="2" fill="#f87171" />
      <path d="M26 34l6 6 6-6" fill="none" stroke="#f87171" strokeWidth="2" />
    </SpriteFrame>);

}

/** Heavy boss golem. */
export function GolemBossSprite({ size, className, animated, label = 'Golem boss' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <ellipse cx="32" cy="60" rx="20" ry="3" fill={INK} opacity="0.18" />
      <rect x="18" y="22" width="28" height="26" rx="5" fill="#78716c" {...S} />
      <rect x="4" y="24" width="12" height="20" rx="4" fill="#57534e" {...S} />
      <rect x="48" y="24" width="12" height="20" rx="4" fill="#57534e" {...S} />
      <rect x="20" y="47" width="10" height="11" rx="3" fill="#57534e" {...S} />
      <rect x="34" y="47" width="10" height="11" rx="3" fill="#57534e" {...S} />
      <rect x="22" y="6" width="20" height="16" rx="4" fill="#a8a29e" {...S} />
      <path d="M26 14h4M34 14h4" stroke="#f97316" strokeWidth="4" />
      <path d="M24 30l6 6-6 6" fill="none" stroke="#f97316" strokeWidth="2" />
      <path d="M40 30l-6 6 6 6" fill="none" stroke="#f97316" strokeWidth="2" />
    </SpriteFrame>);

}

/** Friendly shopkeeper NPC. */
export function MerchantNpcSprite({ size, className, animated, label = 'Merchant NPC' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <ellipse cx="32" cy="60" rx="15" ry="3" fill={INK} opacity="0.15" />
      <path d="M20 58l3-24h18l3 24z" fill="#16a34a" {...S} />
      <rect x="24" y="42" width="16" height="6" rx="2" fill="#a16207" {...S} />
      <circle cx="32" cy="24" r="11" fill="#f4c9a8" {...S} />
      <path d="M18 22a14 14 0 0128 0z" fill="#a16207" {...S} />
      <path d="M14 22h36" {...S} />
      <circle cx="28" cy="25" r="1.8" fill={INK} />
      <circle cx="36" cy="25" r="1.8" fill={INK} />
      <path d="M28 30c2 2 6 2 8 0" fill="none" {...S} />
      <path d="M44 36l10 4-4 10-10-4z" fill="#f59e0b" {...S} />
    </SpriteFrame>);

}

/** Small drone companion / patrolling scout. */
export function DroneSprite({ size, className, animated, label = 'Drone' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M10 18h16M38 18h16" {...S} strokeWidth="3" />
      <rect x="8" y="20" width="6" height="10" rx="2" fill="#64748b" {...S} />
      <rect x="50" y="20" width="6" height="10" rx="2" fill="#64748b" {...S} />
      <ellipse cx="32" cy="34" rx="16" ry="13" fill="#475569" {...S} />
      <circle cx="32" cy="34" r="7" fill="#facc15" {...S} />
      <circle cx="32" cy="34" r="3" fill={INK} />
      <path d="M22 46l-3 6M42 46l3 6" {...S} />
    </SpriteFrame>);

}