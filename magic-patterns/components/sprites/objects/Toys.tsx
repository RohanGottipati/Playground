import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Teddy bear — companion / soft landing. */
export function TeddyBearObject({ size, className, animated, label = 'Teddy bear' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="16" cy="16" r="7" fill="#b45309" {...S} />
      <circle cx="48" cy="16" r="7" fill="#b45309" {...S} />
      <circle cx="32" cy="22" r="14" fill="#d97706" {...S} />
      <ellipse cx="32" cy="44" rx="16" ry="14" fill="#d97706" {...S} />
      <ellipse cx="32" cy="46" rx="9" ry="8" fill="#fbbf24" {...S} strokeWidth="1.5" />
      <circle cx="27" cy="20" r="2" fill={INK} />
      <circle cx="37" cy="20" r="2" fill={INK} />
      <ellipse cx="32" cy="26" rx="3" ry="2" fill={INK} />
    </SpriteFrame>);

}

/** Rubber duck — floats and squeaks. */
export function RubberDuckObject({ size, className, animated, label = 'Rubber duck' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <ellipse cx="30" cy="44" rx="24" ry="14" fill="#facc15" {...S} />
      <circle cx="42" cy="24" r="13" fill="#facc15" {...S} />
      <path d="M52 22l12 4-12 5z" fill="#f97316" {...S} />
      <circle cx="44" cy="20" r="2.5" fill={INK} />
      <path d="M14 44c6 4 14 4 20 0" stroke="#eab308" strokeWidth="2" fill="none" />
    </SpriteFrame>);

}

/** Building brick — stackable modular block. */
export function BuildingBrickObject({ size, className, label = 'Building brick' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="8" y="22" width="48" height="28" rx="4" fill="#dc2626" {...S} />
      <rect x="14" y="12" width="12" height="12" rx="3" fill="#ef4444" {...S} />
      <rect x="38" y="12" width="12" height="12" rx="3" fill="#ef4444" {...S} />
      <path d="M8 34h48" stroke="#991b1b" strokeWidth="2" />
    </SpriteFrame>);

}

/** Dice — randomises a mechanic. */
export function DiceObject({ size, className, animated, label = 'Dice' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <rect x="8" y="8" width="48" height="48" rx="10" fill="#f8fafc" {...S} />
      <circle cx="22" cy="22" r="4" fill={INK} />
      <circle cx="42" cy="22" r="4" fill={INK} />
      <circle cx="32" cy="32" r="4" fill={INK} />
      <circle cx="22" cy="42" r="4" fill={INK} />
      <circle cx="42" cy="42" r="4" fill={INK} />
    </SpriteFrame>);

}

/** Kite — wind-riding glider. */
export function KiteObject({ size, className, animated, label = 'Kite' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M32 2L54 24 32 46 10 24z" fill="#38bdf8" {...S} />
      <path d="M32 2v44M10 24h44" stroke="#0284c7" strokeWidth="2" />
      <path d="M32 46c-4 6 4 10 0 16" fill="none" {...S} />
      <path d="M28 52h8M27 60h8" stroke="#ef4444" strokeWidth="3" />
    </SpriteFrame>);

}

/** Yo-yo — swing / grapple toy. */
export function YoyoObject({ size, className, animated, label = 'Yo-yo' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M32 2v22" {...S} strokeWidth="2" />
      <circle cx="32" cy="40" r="20" fill="#a855f7" {...S} />
      <circle cx="32" cy="40" r="10" fill="#d8b4fe" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="40" r="3" fill="#6b21a8" />
    </SpriteFrame>);

}

/** Spinning top — rotating hazard toy. */
export function SpinningTopObject({ size, className, animated, label = 'Spinning top' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <path d="M10 24h44L32 52z" fill="#ef4444" {...S} />
      <ellipse cx="32" cy="24" rx="22" ry="8" fill="#f8fafc" {...S} />
      <rect x="29" y="6" width="6" height="12" rx="3" fill="#334155" {...S} />
      <path d="M18 26c8 4 20 4 28 0" stroke="#cbd5e1" strokeWidth="2" fill="none" />
    </SpriteFrame>);

}

/** Marble — rolling physics object. */
export function MarbleObject({ size, className, animated, label = 'Marble' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="32" cy="32" r="22" fill="#bae6fd" {...S} />
      <path d="M20 32c4-12 20-16 24-4-8-2-18 2-24 4z" fill="#f472b6" {...S} strokeWidth="1.5" />
      <circle cx="22" cy="22" r="4" fill="#fff" opacity="0.8" />
    </SpriteFrame>);

}

/** Puzzle piece — collectible fragment. */
export function PuzzlePieceObject({ size, className, animated, label = 'Puzzle piece' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M10 14h16a6 6 0 1112 0h16v16a6 6 0 100 12v12H10V32a6 6 0 100-12z" fill="#22c55e" {...S} />
      <path d="M20 24h10" stroke="#15803d" strokeWidth="3" />
    </SpriteFrame>);

}

/** Toy car — small moving object. */
export function ToyCarObject({ size, className, animated, label = 'Toy car' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M8 42V32l10-10h20l10 10h8v10z" fill="#f59e0b" {...S} />
      <path d="M22 24h12v8H18z" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <circle cx="20" cy="46" r="6" fill="#1f2937" {...S} />
      <circle cx="44" cy="46" r="6" fill="#1f2937" {...S} />
    </SpriteFrame>);

}

/** Playing cards — stack that collapses. */
export function PlayingCardsObject({ size, className, label = 'Playing cards' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="10" y="16" width="26" height="38" rx="4" fill="#f8fafc" {...S} transform="rotate(-12 23 35)" />
      <rect x="20" y="14" width="26" height="38" rx="4" fill="#f8fafc" {...S} />
      <path d="M33 24l6 8-6 8-6-8z" fill="#dc2626" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Bubble wand — creates floating bubble platforms. */
export function BubbleWandObject({ size, className, animated, label = 'Bubble wand' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M26 34L16 58" {...S} strokeWidth="4" />
      <circle cx="30" cy="26" r="12" fill="none" stroke="#38bdf8" strokeWidth="4" />
      <circle cx="48" cy="14" r="6" fill="#bae6fd" {...S} strokeWidth="1.5" opacity="0.8" />
      <circle cx="54" cy="30" r="4" fill="#bae6fd" {...S} strokeWidth="1.5" opacity="0.8" />
    </SpriteFrame>);

}

/** Pinwheel — spins in wind zones. */
export function PinwheelObject({ size, className, animated, label = 'Pinwheel' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <path d="M32 26V6c10 0 16 8 16 20zM38 32h20c0 10-8 16-20 16zM26 32V52c-10 0-16-8-16-20zM20 26H4c0-10 8-16 20-16z" fill="#f472b6" {...S} />
      <circle cx="32" cy="29" r="4" fill="#facc15" {...S} strokeWidth="1.5" />
      <path d="M32 33v28" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Jack-in-the-box — surprise launcher. */
export function JackInBoxObject({ size, className, animated, label = 'Jack-in-the-box' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="12" y="32" width="40" height="26" rx="4" fill="#dc2626" {...S} />
      <path d="M12 32h40" stroke="#991b1b" strokeWidth="3" />
      <path d="M32 32c8-4-8-8 0-12s-8-8 0-12" fill="none" stroke="#94a3b8" strokeWidth="3" />
      <circle cx="32" cy="8" r="7" fill="#fde68a" {...S} />
      <circle cx="29" cy="7" r="1.5" fill={INK} />
      <circle cx="35" cy="7" r="1.5" fill={INK} />
    </SpriteFrame>);

}

/** Action figure — collectible character. */
export function ActionFigureObject({ size, className, animated, label = 'Action figure' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="32" cy="14" r="9" fill="#fbbf24" {...S} />
      <rect x="24" y="24" width="16" height="20" rx="4" fill="#2563eb" {...S} />
      <path d="M24 28l-12 6M40 28l12 6" {...S} strokeWidth="5" strokeLinecap="round" />
      <rect x="25" y="44" width="6" height="14" rx="2" fill="#1e40af" {...S} />
      <rect x="33" y="44" width="6" height="14" rx="2" fill="#1e40af" {...S} />
    </SpriteFrame>);

}
