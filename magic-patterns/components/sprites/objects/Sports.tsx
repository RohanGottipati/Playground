import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Basketball — bouncing physics object. */
export function BasketballObject({ size, className, animated, label = 'Basketball' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="32" cy="32" r="26" fill="#f97316" {...S} />
      <path d="M6 32h52M32 6v52M14 14c12 8 12 28 0 36M50 14c-12 8-12 28 0 36" fill="none" {...S} />
    </SpriteFrame>);

}

/** Soccer ball — kickable object. */
export function SoccerBallObject({ size, className, animated, label = 'Soccer ball' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="32" cy="32" r="26" fill="#f8fafc" {...S} />
      <path d="M32 18l10 8-4 12H26l-4-12z" fill={INK} />
      <path d="M32 6v12M10 26l12 4M54 26l-12 4M20 52l6-14M44 52l-6-14" {...S} />
    </SpriteFrame>);

}

/** Tennis racket — swat projectiles back. */
export function TennisRacketObject({ size, className, label = 'Tennis racket' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <ellipse cx="32" cy="22" rx="18" ry="20" fill="#bef264" {...S} />
      <path d="M20 12v20M26 8v28M32 6v32M38 8v28M44 12v20M16 16h32M15 22h34M16 30h32" stroke="#65a30d" strokeWidth="1.5" />
      <path d="M32 42v18" {...S} strokeWidth="6" />
      <path d="M32 48v12" stroke="#dc2626" strokeWidth="4" />
    </SpriteFrame>);

}

/** Baseball bat — melee weapon. */
export function BaseballBatObject({ size, className, label = 'Baseball bat' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M14 52c-4-4-2-8 2-10L40 16c6-6 14-2 10 6L28 48c-4 6-10 8-14 4z" fill="#d97706" {...S} />
      <path d="M14 52l-6 6" {...S} strokeWidth="4" />
      <path d="M20 44l4 4" stroke="#92400e" strokeWidth="2" />
    </SpriteFrame>);

}

/** Skateboard — rideable moving platform. */
export function SkateboardObject({ size, className, animated, label = 'Skateboard' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M4 32c0-4 6-6 12-6h32c6 0 12 2 12 6s-6 6-12 6H16c-6 0-12-2-12-6z" fill="#7c3aed" {...S} />
      <circle cx="18" cy="44" r="6" fill="#facc15" {...S} />
      <circle cx="46" cy="44" r="6" fill="#facc15" {...S} />
      <path d="M14 38v4M50 38v4" {...S} strokeWidth="3" />
      <path d="M20 30h24" stroke="#a78bfa" strokeWidth="3" />
    </SpriteFrame>);

}

/** Bicycle — fast traversal vehicle. */
export function BicycleObject({ size, className, animated, label = 'Bicycle' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <circle cx="16" cy="42" r="14" fill="none" {...S} strokeWidth="3" />
      <circle cx="48" cy="42" r="14" fill="none" {...S} strokeWidth="3" />
      <path d="M16 42l12-18h12l8 18M28 24h16M32 42h14" fill="none" stroke="#dc2626" strokeWidth="3" />
      <path d="M40 18h8" {...S} strokeWidth="3" />
      <circle cx="32" cy="42" r="3" fill="#475569" />
    </SpriteFrame>);

}

/** Helmet — armour pickup. */
export function HelmetObject({ size, className, animated, label = 'Helmet' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M8 40a24 24 0 0148 0v6H8z" fill="#0ea5e9" {...S} />
      <path d="M14 30h36" stroke="#0369a1" strokeWidth="3" />
      <path d="M8 46h48v6H8z" fill="#075985" {...S} />
      <path d="M22 22l4 12M42 22l-4 12" stroke="#7dd3fc" strokeWidth="3" />
    </SpriteFrame>);

}

/** Dumbbell — heavy pushable weight. */
export function DumbbellObject({ size, className, label = 'Dumbbell' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="20" y="28" width="24" height="8" rx="3" fill="#94a3b8" {...S} />
      <rect x="6" y="18" width="12" height="28" rx="4" fill="#334155" {...S} />
      <rect x="46" y="18" width="12" height="28" rx="4" fill="#334155" {...S} />
      <rect x="2" y="24" width="6" height="16" rx="3" fill="#475569" {...S} />
      <rect x="56" y="24" width="6" height="16" rx="3" fill="#475569" {...S} />
    </SpriteFrame>);

}

/** Jump rope — swingable rope. */
export function JumpRopeObject({ size, className, animated, label = 'Jump rope' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M14 16C4 34 12 54 32 54s28-20 18-38" fill="none" stroke="#ef4444" strokeWidth="4" />
      <rect x="8" y="6" width="10" height="16" rx="4" fill="#1d4ed8" {...S} />
      <rect x="46" y="6" width="10" height="16" rx="4" fill="#1d4ed8" {...S} />
    </SpriteFrame>);

}

/** Surfboard — floats on water. */
export function SurfboardObject({ size, className, animated, label = 'Surfboard' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M32 2c12 12 14 42 0 60C18 44 20 14 32 2z" fill="#f8fafc" {...S} />
      <path d="M32 6v52" stroke="#0ea5e9" strokeWidth="3" />
      <path d="M24 24h16M22 36h20" stroke="#fb7185" strokeWidth="3" />
    </SpriteFrame>);

}

/** Ski pair — slide fast on ice. */
export function SkiObject({ size, className, label = 'Skis' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M6 44h40c6 0 10-2 12-6-4-2-8-2-12-2H8a2 2 0 00-2 2z" fill="#ef4444" {...S} />
      <path d="M6 56h40c6 0 10-2 12-6-4-2-8-2-12-2H8a2 2 0 00-2 2z" fill="#3b82f6" {...S} />
      <path d="M20 36V10M34 48V16" {...S} strokeWidth="3" />
      <path d="M16 14h8M30 20h8" {...S} strokeWidth="2" />
    </SpriteFrame>);

}

/** Hockey stick — puck launcher. */
export function HockeyStickObject({ size, className, label = 'Hockey stick' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M46 4l-8 40H14v10h34l10-50z" fill="#b45309" {...S} />
      <path d="M14 48h30" stroke="#fbbf24" strokeWidth="3" />
      <circle cx="8" cy="52" r="5" fill={INK} {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Boxing glove — spring-loaded punch trap. */
export function BoxingGloveObject({ size, className, animated, label = 'Boxing glove' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M12 24a20 20 0 0134-10c8 8 8 24-2 30l-4 12H20l-4-12c-3-4-4-8-4-20z" fill="#dc2626" {...S} />
      <path d="M12 30h12a8 8 0 010 12H16" fill="#dc2626" {...S} />
      <rect x="18" y="50" width="26" height="8" rx="3" fill="#f8fafc" {...S} />
    </SpriteFrame>);

}

/** Frisbee — thrown returning projectile. */
export function FrisbeeObject({ size, className, animated, label = 'Frisbee' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <ellipse cx="32" cy="34" rx="28" ry="12" fill="#f97316" {...S} />
      <ellipse cx="32" cy="30" rx="20" ry="8" fill="#fdba74" {...S} strokeWidth="1.5" />
      <ellipse cx="32" cy="30" rx="8" ry="3" fill="#ea580c" />
    </SpriteFrame>);

}

/** Bowling ball — heavy rolling hazard. */
export function BowlingBallObject({ size, className, animated, label = 'Bowling ball' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <circle cx="32" cy="32" r="26" fill="#1e1b4b" {...S} />
      <circle cx="26" cy="24" r="3.5" fill="#312e81" />
      <circle cx="36" cy="22" r="3.5" fill="#312e81" />
      <circle cx="32" cy="32" r="3.5" fill="#312e81" />
      <path d="M16 18a20 20 0 018-6" stroke="#6366f1" strokeWidth="3" fill="none" />
    </SpriteFrame>);

}

/** Bowling pin — knockable object. */
export function BowlingPinObject({ size, className, label = 'Bowling pin' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M32 4c6 0 8 8 6 14s-2 8 2 14 4 22-8 26-12-20-8-26 4-8 2-14 0-14 6-14z" fill="#f8fafc" {...S} />
      <path d="M26 20h12M25 26h14" stroke="#dc2626" strokeWidth="3" />
    </SpriteFrame>);

}

/** Yoga mat — soft rollable platform. */
export function YogaMatObject({ size, className, label = 'Yoga mat' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="30" width="42" height="14" rx="6" fill="#a855f7" {...S} />
      <circle cx="48" cy="37" r="14" fill="#c084fc" {...S} />
      <circle cx="48" cy="37" r="6" fill="#7e22ce" {...S} strokeWidth="1.5" />
      <path d="M10 37h30" stroke="#7e22ce" strokeWidth="2" />
    </SpriteFrame>);

}

/** Roller skate — speed boost object. */
export function RollerSkateObject({ size, className, animated, label = 'Roller skate' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M16 12h16v22h20a6 6 0 016 6v6H16z" fill="#f472b6" {...S} />
      <path d="M20 18h8M20 26h8" stroke="#fff" strokeWidth="2" />
      <rect x="14" y="46" width="42" height="5" rx="2" fill="#475569" {...S} />
      <circle cx="24" cy="56" r="6" fill="#facc15" {...S} />
      <circle cx="46" cy="56" r="6" fill="#facc15" {...S} />
    </SpriteFrame>);

}
