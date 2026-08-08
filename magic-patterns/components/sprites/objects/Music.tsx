import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Guitar — string platform / weapon. */
export function GuitarObject({ size, className, animated, label = 'Guitar' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M24 38a14 16 0 1028 0 12 12 0 00-28 0z" fill="#b45309" {...S} />
      <circle cx="38" cy="38" r="6" fill="#78350f" {...S} strokeWidth="1.5" />
      <path d="M28 30L8 8" {...S} strokeWidth="6" />
      <path d="M28 30L8 8" stroke="#92400e" strokeWidth="4" />
      <path d="M4 4l8 8" {...S} strokeWidth="3" />
      <path d="M30 34l14 8" stroke="#e2e8f0" strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Drum — bounce pad with rhythm. */
export function DrumObject({ size, className, animated, label = 'Drum' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <ellipse cx="32" cy="24" rx="26" ry="10" fill="#f8fafc" {...S} />
      <path d="M6 24v16c0 6 12 10 26 10s26-4 26-10V24" fill="#dc2626" {...S} />
      <path d="M10 28l12 18M54 28L42 46M32 30v20" stroke="#fef3c7" strokeWidth="2" />
      <path d="M44 8l6 10M20 8l-6 10" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Piano keys — sequence puzzle platform. */
export function PianoObject({ size, className, label = 'Piano keys' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="22" width="56" height="24" rx="4" fill="#f8fafc" {...S} />
      <path d="M14 22v24M24 22v24M34 22v24M44 22v24M54 22v24" stroke={INK} strokeWidth="1.5" />
      {[10, 20, 40, 50].map((x) =>
      <rect key={x} x={x} y="22" width="7" height="14" rx="1" fill={INK} />
      )}
    </SpriteFrame>);

}

/** Trumpet — blast of air pushes the player. */
export function TrumpetObject({ size, className, animated, label = 'Trumpet' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M8 28h28v10H8z" fill="#f59e0b" {...S} />
      <path d="M36 20l16-6v36l-16-6z" fill="#fbbf24" {...S} />
      <rect x="4" y="28" width="6" height="10" rx="3" fill="#d97706" {...S} />
      <path d="M16 20v8M24 20v8" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Microphone — shout mechanic / boss stage prop. */
export function MicrophoneObject({ size, className, animated, label = 'Microphone' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="32" cy="18" r="14" fill="#94a3b8" {...S} />
      <path d="M20 14h24M20 20h24M24 26h16" stroke="#475569" strokeWidth="2" />
      <rect x="27" y="32" width="10" height="24" rx="4" fill="#334155" {...S} />
      <rect x="20" y="56" width="24" height="5" rx="2" fill="#1f2937" {...S} />
    </SpriteFrame>);

}

/** Vinyl record — spinning disc platform. */
export function VinylObject({ size, className, animated, label = 'Vinyl record' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <circle cx="32" cy="32" r="26" fill="#1f2937" {...S} />
      <circle cx="32" cy="32" r="18" fill="none" stroke="#374151" strokeWidth="2" />
      <circle cx="32" cy="32" r="12" fill="#ef4444" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="32" r="2.5" fill="#f8fafc" />
    </SpriteFrame>);

}

/** Violin — elegant swing object. */
export function ViolinObject({ size, className, label = 'Violin' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M32 22c8 0 12 6 12 14s-4 20-12 20-12-8-12-20 4-14 12-14z" fill="#b45309" {...S} />
      <path d="M20 34c-4 2-4 8 0 10M44 34c4 2 4 8 0 10" fill="none" {...S} />
      <path d="M32 22V6" {...S} strokeWidth="4" />
      <path d="M28 4h8v6h-8z" fill="#78350f" {...S} strokeWidth="1.5" />
      <path d="M29 24v30M35 24v30" stroke="#fef3c7" strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Xylophone — tuned platform row. */
export function XylophoneObject({ size, className, label = 'Xylophone' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      {['#ef4444', '#f97316', '#facc15', '#4ade80', '#38bdf8'].map((c, i) =>
      <rect key={c} x={6 + i * 11} y={20 + i * 3} width="9" height={30 - i * 3} rx="3" fill={c} stroke={INK} strokeWidth="2" />
      )}
      <path d="M4 52h56" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Maracas — shake to stun enemies. */
export function MaracasObject({ size, className, animated, label = 'Maracas' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <circle cx="20" cy="20" r="12" fill="#f97316" {...S} />
      <path d="M20 32l-6 26" {...S} strokeWidth="5" />
      <circle cx="46" cy="24" r="11" fill="#facc15" {...S} />
      <path d="M46 35l4 23" {...S} strokeWidth="5" />
      <path d="M14 18h12M40 22h12" stroke="#7c2d12" strokeWidth="2" />
    </SpriteFrame>);

}

/** Cassette tape — save / soundtrack collectible. */
export function CassetteObject({ size, className, animated, label = 'Cassette tape' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="6" y="16" width="52" height="32" rx="4" fill="#334155" {...S} />
      <rect x="12" y="22" width="40" height="14" rx="2" fill="#e2e8f0" {...S} strokeWidth="1.5" />
      <circle cx="24" cy="29" r="4" fill="#334155" {...S} strokeWidth="1.5" />
      <circle cx="40" cy="29" r="4" fill="#334155" {...S} strokeWidth="1.5" />
      <path d="M14 42h36" stroke="#94a3b8" strokeWidth="3" />
    </SpriteFrame>);

}

/** Tambourine — rhythmic bounce. */
export function TambourineObject({ size, className, animated, label = 'Tambourine' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <circle cx="32" cy="32" r="24" fill="#fbbf24" {...S} />
      <circle cx="32" cy="32" r="17" fill="#fef3c7" {...S} strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((a) =>
      <circle key={a} cx="32" cy="8" r="4" fill="#e2e8f0" stroke={INK} strokeWidth="1.5" transform={`rotate(${a} 32 32)`} />
      )}
    </SpriteFrame>);

}

/** Harmonica — small collectible instrument. */
export function HarmonicaObject({ size, className, label = 'Harmonica' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="24" width="56" height="18" rx="4" fill="#94a3b8" {...S} />
      <rect x="8" y="28" width="48" height="4" rx="2" fill="#cbd5e1" />
      {[12, 20, 28, 36, 44, 52].map((x) =>
      <rect key={x} x={x} y="34" width="5" height="5" rx="1" fill="#334155" />
      )}
    </SpriteFrame>);

}
