import React from 'react';
import { SpriteFrame, INK } from './SpriteFrame';
import type { SpriteProps } from '../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Standard bounce pad — launches the player upward. */
export function BouncePad({ size, className, animated, label = 'Bounce pad' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="10" y="44" width="44" height="14" rx="4" fill="#475569" {...S} />
      <path d="M18 44c0-8 28-8 28 0" fill="none" stroke="#94a3b8" strokeWidth="4" />
      <rect x="8" y="28" width="48" height="12" rx="6" fill="#22c55e" {...S} />
      <path d="M22 22l10-10 10 10" fill="none" stroke="#16a34a" strokeWidth="3" />
      <path d="M22 12l10-10 10 10" fill="none" stroke="#86efac" strokeWidth="3" />
    </SpriteFrame>);

}

/** Inflatable bouncy castle — large soft-body bounce zone. */
export function BouncyCastle({ size, className, animated, label = 'Bouncy castle' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="4" y="30" width="56" height="28" rx="8" fill="#f472b6" {...S} />
      <rect x="12" y="38" width="16" height="20" rx="4" fill="#fbcfe8" {...S} />
      <path d="M12 38h16" {...S} />
      <rect x="34" y="40" width="18" height="10" rx="3" fill="#fde68a" {...S} />
      <path d="M4 30h8v-8h8v8h8v-8h8v8h8v-8h8v8h8" fill="#a855f7" {...S} />
      <path d="M8 22v-8M56 22v-8" {...S} />
      <path d="M8 14l7 3-7 3zM56 14l-7 3 7 3z" fill="#38bdf8" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Umbrella glider — slows descent while held. */
export function UmbrellaGlider({ size, className, animated, label = 'Umbrella glider' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M2 30a30 22 0 0160 0z" fill="#ef4444" {...S} />
      <path d="M2 30c6-8 10-8 15 0 5-8 9-8 15 0 6-8 10-8 15 0 5-8 9-8 15 0" fill="none" {...S} />
      <path d="M17 30a15 24 0 0130 0" fill="#fca5a5" opacity="0.6" />
      <path d="M32 8V30" {...S} />
      <path d="M32 30v22a6 6 0 01-12 0" fill="none" {...S} strokeWidth="3" />
      <circle cx="32" cy="6" r="3" fill="#fbbf24" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Parachute glider variant. */
export function ParachuteGlider({ size, className, animated, label = 'Parachute' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M4 26a28 20 0 0156 0z" fill="#f59e0b" {...S} />
      <path d="M22 26a10 20 0 0120 0" fill="#fde68a" {...S} strokeWidth="1.5" />
      <path d="M4 26l14 18M32 26v18M60 26L46 44" fill="none" {...S} strokeWidth="1.5" />
      <rect x="24" y="44" width="16" height="12" rx="4" fill="#0ea5e9" {...S} />
    </SpriteFrame>);

}

/** Hang-glider wing pickup. */
export function HangGlider({ size, className, animated, label = 'Hang glider' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M2 22l30-10 30 10-30 12z" fill="#a78bfa" {...S} />
      <path d="M32 12v22M2 22l30 12M62 22L32 34" fill="none" {...S} strokeWidth="1.5" />
      <path d="M32 34v10" {...S} />
      <rect x="22" y="44" width="20" height="8" rx="4" fill="#334155" {...S} />
    </SpriteFrame>);

}

/** Chair prop — sittable / pushable object. */
export function ChairProp({ size, className, label = 'Chair' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="18" y="6" width="28" height="26" rx="4" fill="#b45309" {...S} />
      <path d="M24 12v14M32 12v14M40 12v14" stroke="#92400e" strokeWidth="2" />
      <rect x="12" y="32" width="40" height="8" rx="3" fill="#d97706" {...S} />
      <rect x="15" y="40" width="6" height="18" rx="2" fill="#92400e" {...S} />
      <rect x="43" y="40" width="6" height="18" rx="2" fill="#92400e" {...S} />
    </SpriteFrame>);

}

/** Beanbag / soft landing seat. */
export function BeanbagProp({ size, className, label = 'Beanbag' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M8 56c-4-14 4-28 24-28s28 14 24 28z" fill="#14b8a6" {...S} />
      <path d="M20 34c6 6 18 6 24 0" fill="none" stroke="#0f766e" strokeWidth="2" />
      <path d="M14 48h36" stroke="#0f766e" strokeWidth="2" />
    </SpriteFrame>);

}

/** Trampoline with sprung frame. */
export function Trampoline({ size, className, animated, label = 'Trampoline' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <ellipse cx="32" cy="30" rx="28" ry="10" fill="#1e293b" {...S} />
      <ellipse cx="32" cy="28" rx="22" ry="7" fill="#0f172a" />
      <path d="M8 34l-2 20M56 34l2 20M20 38v18M44 38v18" {...S} strokeWidth="3" />
      <path d="M4 54h56" {...S} strokeWidth="3" />
      <path d="M32 20l-6-8h12z" fill="#22c55e" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Coiled spring launcher. */
export function SpringLauncher({ size, className, animated, label = 'Spring' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="12" y="54" width="40" height="8" rx="3" fill="#475569" {...S} />
      <path d="M18 54c28-4-28-10 0-14 28-4-28-10 0-14" fill="none" stroke="#94a3b8" strokeWidth="4" />
      <rect x="10" y="14" width="44" height="10" rx="5" fill="#ef4444" {...S} />
    </SpriteFrame>);

}

/** Warp portal between two points. */
export function PortalGate({ size, className, animated, label = 'Portal' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <ellipse cx="32" cy="32" rx="20" ry="28" fill="#7c3aed" {...S} />
      <ellipse cx="32" cy="32" rx="13" ry="20" fill="#a78bfa" {...S} strokeWidth="1.5" />
      <ellipse cx="32" cy="32" rx="6" ry="11" fill="#ede9fe" />
      <circle cx="14" cy="18" r="2" fill="#c4b5fd" />
      <circle cx="52" cy="44" r="2.5" fill="#c4b5fd" />
      <circle cx="48" cy="14" r="1.5" fill="#c4b5fd" />
    </SpriteFrame>);

}

/** End-of-level goal door. */
export function ExitDoor({ size, className, animated, label = 'Exit door' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M10 58V22a22 22 0 0144 0v36z" fill="#7c2d12" {...S} />
      <path d="M16 58V22a16 16 0 0132 0v36z" fill="#c2410c" {...S} strokeWidth="1.5" />
      <path d="M32 12v46" stroke="#7c2d12" strokeWidth="2" />
      <circle cx="27" cy="38" r="2.5" fill="#facc15" {...S} strokeWidth="1.5" />
      <circle cx="37" cy="38" r="2.5" fill="#facc15" {...S} strokeWidth="1.5" />
      <path d="M22 26h20" stroke="#fdba74" strokeWidth="2" />
    </SpriteFrame>);

}

/** Locked door requiring a key. */
export function LockedDoor({ size, className, label = 'Locked door' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="12" y="8" width="40" height="50" rx="5" fill="#334155" {...S} />
      <rect x="18" y="14" width="28" height="38" rx="3" fill="#475569" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="30" r="7" fill="none" stroke="#facc15" strokeWidth="3" />
      <rect x="24" y="30" width="16" height="14" rx="3" fill="#facc15" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="37" r="2" fill={INK} />
    </SpriteFrame>);

}

/** Goal flag / checkpoint banner. */
export function GoalFlag({ size, className, animated, label = 'Goal flag' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M16 60V6" {...S} strokeWidth="4" />
      <circle cx="16" cy="5" r="3" fill="#facc15" {...S} strokeWidth="1.5" />
      <path d="M18 10h34v20H18z" fill="#f8fafc" {...S} />
      <path d="M18 10h8v7h9v-7h9v7h8v6h-8v7h-9v-7h-9v7h-8z" fill={INK} opacity="0.85" />
      <path d="M8 60h20" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Mid-level checkpoint marker. */
export function CheckpointFlag({ size, className, animated, label = 'Checkpoint' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M18 60V8" {...S} strokeWidth="4" />
      <path d="M20 10l26 8-26 8z" fill="#22c55e" {...S} />
      <path d="M28 18l4 4 8-8" fill="none" stroke="#fff" strokeWidth="3" />
      <ellipse cx="20" cy="60" rx="12" ry="3" fill={INK} opacity="0.2" />
    </SpriteFrame>);

}

/** Pull lever that toggles level state. */
export function PullLever({ size, className, label = 'Lever' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="14" y="44" width="36" height="14" rx="4" fill="#475569" {...S} />
      <path d="M32 46L46 20" {...S} strokeWidth="5" />
      <circle cx="47" cy="16" r="7" fill="#ef4444" {...S} />
      <circle cx="32" cy="46" r="3" fill="#94a3b8" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Floor pressure plate. */
export function PressurePlate({ size, className, label = 'Pressure plate' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="6" y="46" width="52" height="12" rx="3" fill="#475569" {...S} />
      <rect x="12" y="36" width="40" height="12" rx="4" fill="#94a3b8" {...S} />
      <path d="M22 32l10-8 10 8" fill="none" stroke="#facc15" strokeWidth="3" />
      <circle cx="32" cy="42" r="3" fill="#facc15" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Zip line the player rides across gaps. */
export function ZipLine({ size, className, animated, label = 'Zip line' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M4 10L60 34" {...S} strokeWidth="2" />
      <rect x="2" y="4" width="8" height="8" rx="2" fill="#57534e" {...S} />
      <rect x="54" y="30" width="8" height="8" rx="2" fill="#57534e" {...S} />
      <circle cx="28" cy="20" r="5" fill="#94a3b8" {...S} />
      <path d="M28 25v10" {...S} strokeWidth="3" />
      <rect x="20" y="35" width="16" height="6" rx="3" fill="#f59e0b" {...S} />
    </SpriteFrame>);

}

/** Grapple anchor point. */
export function GrapplePoint({ size, className, animated, label = 'Grapple point' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <circle cx="32" cy="32" r="20" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="5 5" />
      <circle cx="32" cy="32" r="12" fill="#0e7490" {...S} />
      <circle cx="32" cy="32" r="5" fill="#67e8f9" {...S} strokeWidth="1.5" />
      <path d="M32 6v8M32 50v8M6 32h8M50 32h8" stroke="#22d3ee" strokeWidth="3" />
    </SpriteFrame>);

}

/** Floor fan producing an updraft column. */
export function UpdraftFan({ size, className, animated, label = 'Updraft fan' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="10" y="42" width="44" height="16" rx="5" fill="#475569" {...S} />
      <circle cx="32" cy="50" r="6" fill="#94a3b8" {...S} strokeWidth="1.5" />
      <path d="M32 50L20 46M32 50l12-4M32 50v-8" stroke="#e2e8f0" strokeWidth="2.5" />
      <path d="M18 36c0-6 4-10 4-16M32 36c0-8 4-12 4-20M46 36c0-6 4-10 4-16" fill="none" stroke="#7dd3fc" strokeWidth="3" />
    </SpriteFrame>);

}

/** Lift balloon the player can ride. */
export function LiftBalloon({ size, className, animated, label = 'Balloon lift' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M32 4a18 20 0 0110 36l-4 4h-12l-4-4A18 20 0 0132 4z" fill="#ef4444" {...S} />
      <path d="M26 8c-4 6-4 18 0 26" fill="none" stroke="#fca5a5" strokeWidth="3" />
      <path d="M26 44l-4 10M38 44l4 10" fill="none" {...S} strokeWidth="1.5" />
      <rect x="20" y="52" width="24" height="10" rx="3" fill="#b45309" {...S} />
    </SpriteFrame>);

}

/** Jetpack pickup for vertical traversal. */
export function JetpackPickup({ size, className, animated, label = 'Jetpack' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="12" y="12" width="16" height="30" rx="8" fill="#64748b" {...S} />
      <rect x="36" y="12" width="16" height="30" rx="8" fill="#64748b" {...S} />
      <rect x="26" y="18" width="12" height="16" rx="3" fill="#475569" {...S} />
      <path d="M20 42c0 8-4 10-4 16 6-2 8-6 8-16zM44 42c0 8 4 10 4 16-6-2-8-6-8-16z" fill="#f97316" {...S} />
      <circle cx="20" cy="18" r="2.5" fill="#f87171" />
      <circle cx="44" cy="18" r="2.5" fill="#f87171" />
    </SpriteFrame>);

}

/** Cannon that fires the player across the level. */
export function LaunchCannon({ size, className, animated, label = 'Launch cannon' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M12 58l4-12h32l4 12z" fill="#57534e" {...S} />
      <rect x="16" y="14" width="24" height="34" rx="10" fill="#334155" {...S} transform="rotate(-25 28 30)" />
      <ellipse cx="20" cy="16" rx="12" ry="7" fill="#1f2937" {...S} transform="rotate(-25 20 16)" />
      <circle cx="34" cy="44" r="4" fill="#f59e0b" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Water bucket / swim zone tile. */
export function WaterTile({ size, className, animated, label = 'Water' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="2" y="24" width="60" height="34" rx="4" fill="#0ea5e9" {...S} />
      <path d="M2 30c8-5 12 5 20 0s12 5 20 0 12 5 20 0" fill="none" stroke="#7dd3fc" strokeWidth="3" />
      <circle cx="18" cy="44" r="3" fill="#bae6fd" opacity="0.8" />
      <circle cx="42" cy="50" r="2" fill="#bae6fd" opacity="0.8" />
    </SpriteFrame>);

}

/** Vine / rope the player can climb or swing on. */
export function SwingVine({ size, className, animated, label = 'Swing vine' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M32 2c4 12-4 18 0 30s-4 18 0 28" fill="none" stroke="#15803d" strokeWidth="4" />
      <path d="M32 14c6-2 8-6 8-6s-2 8-8 8zM32 34c-6-2-8-6-8-6s2 8 8 8z" fill="#22c55e" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="58" r="5" fill="#a16207" {...S} />
    </SpriteFrame>);

}