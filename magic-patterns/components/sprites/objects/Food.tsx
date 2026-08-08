import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Pizza slice — health restore. */
export function PizzaObject({ size, className, animated, label = 'Pizza slice' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M32 4l24 48a80 80 0 01-48 0z" fill="#fbbf24" {...S} />
      <path d="M10 48a70 70 0 0044 0l2 4a80 80 0 01-48 0z" fill="#d97706" {...S} strokeWidth="1.5" />
      <circle cx="30" cy="28" r="4" fill="#ef4444" {...S} strokeWidth="1.5" />
      <circle cx="40" cy="40" r="4" fill="#ef4444" {...S} strokeWidth="1.5" />
      <circle cx="22" cy="42" r="3.5" fill="#ef4444" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Burger — big health pickup. */
export function BurgerObject({ size, className, animated, label = 'Burger' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M6 28a26 18 0 0152 0z" fill="#f59e0b" {...S} />
      <path d="M6 28h52v6H6z" fill="#4ade80" {...S} />
      <rect x="6" y="34" width="52" height="8" rx="3" fill="#92400e" {...S} />
      <rect x="8" y="42" width="48" height="6" rx="3" fill="#fde68a" {...S} />
      <path d="M8 48a24 10 0 0048 0z" fill="#f59e0b" {...S} />
      <circle cx="22" cy="20" r="1.5" fill="#fef3c7" />
      <circle cx="34" cy="17" r="1.5" fill="#fef3c7" />
      <circle cx="44" cy="21" r="1.5" fill="#fef3c7" />
    </SpriteFrame>);

}

/** Donut — collectible ring. */
export function DonutObject({ size, className, animated, label = 'Donut' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <circle cx="32" cy="32" r="26" fill="#f59e0b" {...S} />
      <path d="M32 6a26 26 0 0121 41c-6-4-12 2-18-2s-2-10-8-12-12 2-14-4A26 26 0 0132 6z" fill="#f472b6" {...S} />
      <circle cx="32" cy="32" r="9" fill="#fff" {...S} />
      <path d="M22 22l4-4M42 26l4 2M28 42l4 4" stroke="#fde047" strokeWidth="3" />
    </SpriteFrame>);

}

/** Apple — small health pickup. */
export function AppleObject({ size, className, animated, label = 'Apple' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M32 18c8-8 26-4 24 12s-14 26-24 26S6 46 8 30 24 10 32 18z" fill="#ef4444" {...S} />
      <path d="M32 18V8" {...S} strokeWidth="3" />
      <path d="M32 12c6-6 12-6 12-6s0 8-12 8z" fill="#22c55e" {...S} strokeWidth="1.5" />
      <path d="M20 26a10 10 0 015-6" stroke="#fca5a5" strokeWidth="3" fill="none" />
    </SpriteFrame>);

}

/** Banana — slip hazard. */
export function BananaObject({ size, className, label = 'Banana peel' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M8 22c0 22 14 32 26 32 8 0 14-4 18-10-10 4-24-2-30-12-4-6-4-10-4-14z" fill="#facc15" {...S} />
      <path d="M8 22c-4 0-6 4-4 8" {...S} />
      <path d="M18 40c8 8 20 10 28 6" stroke="#eab308" strokeWidth="2" fill="none" />
    </SpriteFrame>);

}

/** Watermelon slice — splittable pickup. */
export function WatermelonObject({ size, className, animated, label = 'Watermelon' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M4 44a28 28 0 0156 0z" fill="#16a34a" {...S} />
      <path d="M10 44a22 22 0 0144 0z" fill="#f8fafc" {...S} strokeWidth="1.5" />
      <path d="M14 44a18 18 0 0136 0z" fill="#ef4444" {...S} strokeWidth="1.5" />
      <ellipse cx="26" cy="36" rx="2" ry="3" fill={INK} />
      <ellipse cx="38" cy="36" rx="2" ry="3" fill={INK} />
      <ellipse cx="32" cy="42" rx="2" ry="3" fill={INK} />
    </SpriteFrame>);

}

/** Ice cream cone — melts on a timer. */
export function IceCreamObject({ size, className, animated, label = 'Ice cream' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M20 30h24L32 60z" fill="#d97706" {...S} />
      <path d="M24 36l16-2M22 44l20-4" stroke="#b45309" strokeWidth="2" />
      <circle cx="24" cy="24" r="10" fill="#f9a8d4" {...S} />
      <circle cx="40" cy="24" r="10" fill="#fde68a" {...S} />
      <circle cx="32" cy="16" r="10" fill="#a7f3d0" {...S} />
      <circle cx="32" cy="6" r="3" fill="#ef4444" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Cupcake — combo reward. */
export function CupcakeObject({ size, className, animated, label = 'Cupcake' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M16 34h32l-4 24H20z" fill="#f59e0b" {...S} />
      <path d="M24 34v24M32 34v24M40 34v24" stroke="#b45309" strokeWidth="2" />
      <path d="M14 34a18 14 0 0136 0z" fill="#f9a8d4" {...S} />
      <circle cx="32" cy="14" r="4" fill="#ef4444" {...S} strokeWidth="1.5" />
      <circle cx="24" cy="26" r="1.5" fill="#fff" />
      <circle cx="40" cy="28" r="1.5" fill="#fff" />
    </SpriteFrame>);

}

/** Sushi roll — stackable small block. */
export function SushiObject({ size, className, animated, label = 'Sushi' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="12" y="24" width="40" height="26" rx="8" fill="#1f2937" {...S} />
      <ellipse cx="32" cy="30" rx="18" ry="8" fill="#f8fafc" {...S} />
      <ellipse cx="32" cy="30" rx="7" ry="4" fill="#fb7185" {...S} strokeWidth="1.5" />
      <path d="M12 40h40" stroke="#374151" strokeWidth="2" />
    </SpriteFrame>);

}

/** Taco — hinged platform gag. */
export function TacoObject({ size, className, label = 'Taco' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M6 46a26 26 0 0152 0z" fill="#fbbf24" {...S} />
      <path d="M12 40a20 16 0 0140 0z" fill="#4ade80" {...S} strokeWidth="1.5" />
      <path d="M16 42a16 12 0 0132 0z" fill="#b45309" {...S} strokeWidth="1.5" />
      <circle cx="26" cy="40" r="2" fill="#ef4444" />
      <circle cx="38" cy="42" r="2" fill="#ef4444" />
    </SpriteFrame>);

}

/** Hot dog — long thin platform. */
export function HotDogObject({ size, className, label = 'Hot dog' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="2" y="26" width="60" height="16" rx="8" fill="#f59e0b" {...S} />
      <rect x="6" y="28" width="52" height="9" rx="4.5" fill="#dc2626" {...S} strokeWidth="1.5" />
      <path d="M10 32c6-4 10 4 16 0s10 4 16 0 8 4 12 0" fill="none" stroke="#fde047" strokeWidth="3" />
    </SpriteFrame>);

}

/** Coffee cup — speed boost. */
export function CoffeeCupObject({ size, className, animated, label = 'Coffee cup' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M16 22h32l-4 34H20z" fill="#f8fafc" {...S} />
      <rect x="12" y="14" width="40" height="9" rx="4" fill="#b45309" {...S} />
      <rect x="24" y="30" width="16" height="12" rx="2" fill="#78350f" {...S} strokeWidth="1.5" />
      <path d="M24 8c0-4 4-4 4-8M36 8c0-4 4-4 4-8" stroke="#cbd5e1" strokeWidth="2" fill="none" />
    </SpriteFrame>);

}

/** Soda can — fizz-powered jump boost. */
export function SodaCanObject({ size, className, animated, label = 'Soda can' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="18" y="12" width="28" height="42" rx="5" fill="#dc2626" {...S} />
      <ellipse cx="32" cy="12" rx="14" ry="4" fill="#cbd5e1" {...S} />
      <path d="M20 28h24" stroke="#fff" strokeWidth="4" />
      <path d="M20 38h16" stroke="#fca5a5" strokeWidth="3" />
      <circle cx="32" cy="11" r="2" fill="#94a3b8" />
    </SpriteFrame>);

}

/** Egg — fragile object that cracks. */
export function EggObject({ size, className, animated, label = 'Egg' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M32 8c12 0 20 18 20 30a20 20 0 01-40 0c0-12 8-30 20-30z" fill="#fef3c7" {...S} />
      <path d="M20 34l6 6-4 6" fill="none" stroke="#d6d3d1" strokeWidth="2" />
    </SpriteFrame>);

}

/** Cheese wedge — holey platform. */
export function CheeseObject({ size, className, label = 'Cheese' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M6 46L54 18v28z" fill="#facc15" {...S} />
      <circle cx="34" cy="36" r="4" fill="#eab308" />
      <circle cx="46" cy="30" r="3" fill="#eab308" />
      <circle cx="24" cy="42" r="2.5" fill="#eab308" />
    </SpriteFrame>);

}

/** Carrot — thin spike-shaped pickup. */
export function CarrotObject({ size, className, animated, label = 'Carrot' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M26 18h12l-6 40z" fill="#f97316" {...S} />
      <path d="M28 28h8M29 38h6" stroke="#c2410c" strokeWidth="2" />
      <path d="M32 18c-6-4-8-12-8-12s10 0 12 8c2-6 10-8 10-8s-2 10-8 12z" fill="#16a34a" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Popcorn bucket — spawns bouncing kernels. */
export function PopcornObject({ size, className, animated, label = 'Popcorn' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M16 28h32l-4 30H20z" fill="#ef4444" {...S} />
      <path d="M24 28v30M32 28v30M40 28v30" stroke="#fff" strokeWidth="3" />
      <circle cx="22" cy="24" r="6" fill="#fef3c7" {...S} strokeWidth="1.5" />
      <circle cx="34" cy="18" r="7" fill="#fef3c7" {...S} strokeWidth="1.5" />
      <circle cx="46" cy="24" r="6" fill="#fef3c7" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Lollipop — sticky surface. */
export function LollipopObject({ size, className, animated, label = 'Lollipop' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <path d="M32 34v26" {...S} strokeWidth="4" />
      <circle cx="32" cy="22" r="18" fill="#f472b6" {...S} />
      <path d="M32 22c0-6-6-8-10-4s0 12 8 12 14-6 12-14-12-12-20-6" fill="none" stroke="#fff" strokeWidth="3" />
    </SpriteFrame>);

}
