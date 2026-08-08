import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Laptop — checkpoint terminal / platform. */
export function LaptopObject({ size, className, animated, label = 'Laptop' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M14 12h36v28H14z" fill="#475569" {...S} />
      <rect x="18" y="16" width="28" height="20" rx="2" fill="#22d3ee" {...S} strokeWidth="1.5" />
      <path d="M6 40h52l4 8H2z" fill="#94a3b8" {...S} />
      <path d="M26 44h12" stroke="#475569" strokeWidth="2" />
    </SpriteFrame>);

}

/** Smartphone — collectible map / hint device. */
export function PhoneObject({ size, className, animated, label = 'Smartphone' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="18" y="4" width="28" height="56" rx="6" fill="#1f2937" {...S} />
      <rect x="22" y="12" width="20" height="38" rx="2" fill="#38bdf8" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="55" r="2.5" fill="#4b5563" />
      <path d="M28 8h8" stroke="#4b5563" strokeWidth="2" />
      <path d="M26 22h12M26 30h8" stroke="#0369a1" strokeWidth="2" />
    </SpriteFrame>);

}

/** Tablet — thin platform. */
export function TabletObject({ size, className, label = 'Tablet' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="8" y="12" width="48" height="40" rx="5" fill="#334155" {...S} />
      <rect x="13" y="17" width="38" height="30" rx="2" fill="#a5b4fc" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="32" r="6" fill="#6366f1" />
    </SpriteFrame>);

}

/** TV — background prop / cutscene screen. */
export function TvObject({ size, className, animated, label = 'Television' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="6" y="12" width="52" height="34" rx="5" fill="#1f2937" {...S} />
      <rect x="11" y="17" width="42" height="24" rx="2" fill="#60a5fa" {...S} strokeWidth="1.5" />
      <path d="M11 29h42M32 17v24" stroke="#93c5fd" strokeWidth="2" />
      <path d="M24 46l-4 10M40 46l4 10" {...S} strokeWidth="3" />
      <path d="M14 56h36" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Keyboard — long flat platform. */
export function KeyboardObject({ size, className, label = 'Keyboard' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="2" y="22" width="60" height="22" rx="4" fill="#475569" {...S} />
      {[8, 18, 28, 38, 48].map((x) =>
      <rect key={x} x={x} y="27" width="8" height="5" rx="1.5" fill="#cbd5e1" />
      )}
      {[10, 20, 30, 40].map((x) =>
      <rect key={x} x={x} y="34" width="8" height="5" rx="1.5" fill="#cbd5e1" />
      )}
      <rect x="50" y="34" width="6" height="5" rx="1.5" fill="#cbd5e1" />
    </SpriteFrame>);

}

/** Computer mouse — small pushable object. */
export function MouseObject({ size, className, label = 'Computer mouse' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M32 16c10 0 16 8 16 20s-6 16-16 16-16-4-16-16 6-20 16-20z" fill="#e2e8f0" {...S} />
      <path d="M32 16v14" {...S} />
      <rect x="29" y="20" width="6" height="10" rx="3" fill="#94a3b8" {...S} strokeWidth="1.5" />
      <path d="M16 12c4-6 12-8 12-8" stroke="#94a3b8" strokeWidth="2" fill="none" />
    </SpriteFrame>);

}

/** Headphones — mutes hazards / audio pickup. */
export function HeadphonesObject({ size, className, animated, label = 'Headphones' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M10 40V32a22 22 0 0144 0v8" fill="none" {...S} strokeWidth="4" />
      <rect x="4" y="36" width="14" height="20" rx="6" fill="#7c3aed" {...S} />
      <rect x="46" y="36" width="14" height="20" rx="6" fill="#7c3aed" {...S} />
      <rect x="8" y="40" width="6" height="12" rx="3" fill="#c4b5fd" />
    </SpriteFrame>);

}

/** Speaker — sound-wave shockwave hazard. */
export function SpeakerObject({ size, className, animated, label = 'Speaker' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="14" y="6" width="36" height="52" rx="5" fill="#1f2937" {...S} />
      <circle cx="32" cy="38" r="12" fill="#475569" {...S} />
      <circle cx="32" cy="38" r="5" fill="#94a3b8" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="17" r="6" fill="#475569" {...S} />
      <circle cx="32" cy="17" r="2" fill="#94a3b8" />
    </SpriteFrame>);

}

/** Game controller — power-up that adds an extra ability. */
export function ControllerObject({ size, className, animated, label = 'Game controller' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M18 20h28c8 0 14 10 16 22 2 10-8 14-14 6l-4-6H26l-4 6c-6 8-16 4-14-6 2-12 8-22 14-22z" fill="#475569" {...S} />
      <path d="M18 34h10M23 29v10" stroke="#e2e8f0" strokeWidth="3" />
      <circle cx="44" cy="30" r="3" fill="#ef4444" />
      <circle cx="51" cy="36" r="3" fill="#22c55e" />
      <circle cx="44" cy="42" r="3" fill="#3b82f6" />
    </SpriteFrame>);

}

/** Camera — the photo tool itself, as a hub object. */
export function CameraObject({ size, className, animated, label = 'Camera' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M6 20h12l4-6h20l4 6h12a4 4 0 014 4v26a4 4 0 01-4 4H6a4 4 0 01-4-4V24a4 4 0 014-4z" fill="#334155" {...S} />
      <circle cx="32" cy="36" r="13" fill="#94a3b8" {...S} />
      <circle cx="32" cy="36" r="7" fill="#38bdf8" {...S} strokeWidth="1.5" />
      <circle cx="52" cy="26" r="2.5" fill="#facc15" />
    </SpriteFrame>);

}

/** Light bulb — reveals dark areas. */
export function LightBulbObject({ size, className, animated, label = 'Light bulb' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M32 6a18 18 0 0110 33v5H22v-5A18 18 0 0132 6z" fill="#fde047" {...S} />
      <rect x="22" y="44" width="20" height="6" rx="2" fill="#94a3b8" {...S} />
      <rect x="24" y="50" width="16" height="6" rx="3" fill="#64748b" {...S} />
      <path d="M28 20a8 8 0 018-4" stroke="#fff" strokeWidth="3" fill="none" />
    </SpriteFrame>);

}

/** Wi-Fi router — checkpoint / signal zone. */
export function RouterObject({ size, className, animated, label = 'Router' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="10" y="36" width="44" height="18" rx="5" fill="#1f2937" {...S} />
      <path d="M20 36V18M44 36V18" {...S} strokeWidth="3" />
      <circle cx="22" cy="46" r="2.5" fill="#22c55e" />
      <circle cx="30" cy="46" r="2.5" fill="#facc15" />
      <path d="M24 12a14 14 0 0116 0" fill="none" stroke="#38bdf8" strokeWidth="3" />
      <path d="M18 6a24 24 0 0128 0" fill="none" stroke="#7dd3fc" strokeWidth="3" />
    </SpriteFrame>);

}

/** Vintage boombox — spawns rhythm platforms. */
export function BoomboxObject({ size, className, animated, label = 'Boombox' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="4" y="20" width="56" height="30" rx="5" fill="#334155" {...S} />
      <circle cx="17" cy="35" r="9" fill="#94a3b8" {...S} />
      <circle cx="47" cy="35" r="9" fill="#94a3b8" {...S} />
      <rect x="27" y="28" width="10" height="8" rx="2" fill="#facc15" {...S} strokeWidth="1.5" />
      <path d="M27 42h10" stroke="#94a3b8" strokeWidth="3" />
      <path d="M14 20a18 10 0 0136 0" fill="none" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Desk lamp — directional light cone. */
export function DeskLampObject({ size, className, animated, label = 'Desk lamp' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <ellipse cx="26" cy="56" rx="18" ry="5" fill="#334155" {...S} />
      <path d="M26 54V30l14-10" {...S} strokeWidth="4" />
      <path d="M30 22l18-8 8 16-18 6z" fill="#f59e0b" {...S} />
      <path d="M40 38c2 8 4 12 4 16" stroke="#fde047" strokeWidth="3" fill="none" />
    </SpriteFrame>);

}

/** Wall clock — timer object. */
export function WallClockObject({ size, className, animated, label = 'Wall clock' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <circle cx="32" cy="32" r="26" fill="#f8fafc" {...S} />
      <circle cx="32" cy="32" r="20" fill="#fff" {...S} strokeWidth="1.5" />
      <path d="M32 32V16M32 32l12 8" fill="none" {...S} strokeWidth="3" />
      <circle cx="32" cy="32" r="2.5" fill={INK} />
      <path d="M32 10v4M32 50v4M10 32h4M50 32h4" {...S} strokeWidth="2" />
    </SpriteFrame>);

}

/** Vacuum cleaner — sucks in nearby pickups. */
export function VacuumObject({ size, className, animated, label = 'Vacuum cleaner' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M10 56l6-16h20l6 16z" fill="#7c3aed" {...S} />
      <rect x="18" y="30" width="16" height="12" rx="4" fill="#a78bfa" {...S} />
      <path d="M34 34c14-2 18-10 18-22" fill="none" {...S} strokeWidth="4" />
      <circle cx="52" cy="8" r="5" fill="#475569" {...S} />
      <path d="M14 50h24" stroke="#4c1d95" strokeWidth="3" />
    </SpriteFrame>);

}
