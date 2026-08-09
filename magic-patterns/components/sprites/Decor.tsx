import React from 'react';
import { SpriteFrame, INK } from './SpriteFrame';
import type { SpriteProps } from '../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Background tree. */
export function TreeProp({ size, className, animated, label = 'Tree' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <rect x="27" y="36" width="10" height="24" rx="3" fill="#92400e" {...S} />
      <circle cx="32" cy="24" r="18" fill="#16a34a" {...S} />
      <circle cx="20" cy="30" r="10" fill="#22c55e" {...S} />
      <circle cx="45" cy="30" r="9" fill="#22c55e" {...S} />
      <circle cx="26" cy="18" r="3" fill="#86efac" />
    </SpriteFrame>);

}

/** Shrub / bush filler. */
export function BushProp({ size, className, label = 'Bush' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M6 52a12 12 0 018-20 14 14 0 0136 0 12 12 0 018 20z" fill="#16a34a" {...S} />
      <path d="M6 52h52" {...S} />
      <circle cx="24" cy="36" r="2.5" fill="#ef4444" />
      <circle cx="42" cy="42" r="2.5" fill="#ef4444" />
    </SpriteFrame>);

}

/** Background cloud. */
export function CloudProp({ size, className, animated, label = 'Cloud' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M14 44a10 10 0 010-20 12 12 0 0122-6 11 11 0 0116 12 8 8 0 01-4 14z" fill="#f1f5f9" {...S} />
    </SpriteFrame>);

}

/** Sun for daytime skies. */
export function SunProp({ size, className, animated, label = 'Sun' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <circle cx="32" cy="32" r="16" fill="#fbbf24" {...S} />
      <path
        d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M52 12l-6 6M18 46l-6 6"
        stroke="#f59e0b"
        strokeWidth="4"
        strokeLinecap="round" />
      
    </SpriteFrame>);

}

/** Crescent moon for night levels. */
export function MoonProp({ size, className, animated, label = 'Moon' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M40 6a26 26 0 100 52A30 30 0 0140 6z" fill="#e2e8f0" {...S} />
      <circle cx="26" cy="24" r="4" fill="#cbd5e1" />
      <circle cx="22" cy="40" r="3" fill="#cbd5e1" />
      <circle cx="54" cy="14" r="2" fill="#fef08a" />
    </SpriteFrame>);

}

/** Distant mountain range. */
export function MountainProp({ size, className, label = 'Mountains' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M2 56L22 20l14 22 8-12 18 26z" fill="#64748b" {...S} />
      <path d="M22 20l7 11h-14zM44 30l5 7h-9z" fill="#f8fafc" />
    </SpriteFrame>);

}

/** Wall torch light source. */
export function TorchProp({ size, className, animated, label = 'Torch' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="28" y="28" width="8" height="30" rx="3" fill="#92400e" {...S} />
      <path d="M32 6c7 8 10 12 10 18a10 10 0 01-20 0c0-6 3-10 10-18z" fill="#f97316" {...S} />
      <path d="M32 18c3 4 4 6 4 9a4 4 0 01-8 0c0-3 1-5 4-9z" fill="#fde047" />
    </SpriteFrame>);

}

/** Street lamp. */
export function LampPostProp({ size, className, label = 'Lamp post' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="29" y="18" width="6" height="42" rx="3" fill="#334155" {...S} />
      <rect x="18" y="52" width="28" height="8" rx="3" fill="#1e293b" {...S} />
      <path d="M20 18h24l-6-10H26z" fill="#facc15" {...S} />
      <path d="M24 6h16" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Wooden direction sign. */
export function SignPost({ size, className, label = 'Sign post' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="29" y="30" width="6" height="30" rx="2" fill="#92400e" {...S} />
      <rect x="8" y="10" width="48" height="22" rx="4" fill="#d97706" {...S} />
      <path d="M16 18h24M16 24h16" stroke="#7c2d12" strokeWidth="3" />
    </SpriteFrame>);

}

/** Storage barrel prop. */
export function BarrelProp({ size, className, label = 'Barrel' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M16 12h32c4 12 4 28 0 46H16c-4-18-4-34 0-46z" fill="#b45309" {...S} />
      <path d="M13 24h38M13 44h38" stroke="#78350f" strokeWidth="3" />
      <path d="M32 12v46" stroke="#92400e" strokeWidth="2" />
    </SpriteFrame>);

}

/** Campfire prop. */
export function CampfireProp({ size, className, animated, label = 'Campfire' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M10 54l44-8M54 54L10 46" stroke="#92400e" strokeWidth="7" strokeLinecap="round" />
      <path d="M32 8c10 12 14 16 14 24a14 14 0 01-28 0c0-8 4-12 14-24z" fill="#f97316" {...S} />
      <path d="M32 26c4 6 6 8 6 12a6 6 0 01-12 0c0-4 2-6 6-12z" fill="#fde047" />
    </SpriteFrame>);

}

/** Beach umbrella decor (matches the umbrella glider family). */
export function BeachUmbrella({ size, className, animated, label = 'Beach umbrella' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M4 26a28 20 0 0156 0z" fill="#f8fafc" {...S} />
      <path d="M18 26a28 20 0 0110-19 28 20 0 016 19zM46 26a28 20 0 00-8-18" fill="#ef4444" {...S} strokeWidth="1.5" />
      <path d="M32 6v52" {...S} strokeWidth="3" />
      <ellipse cx="32" cy="58" rx="10" ry="3" fill="#fbbf24" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Small table prop. */
export function TableProp({ size, className, label = 'Table' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="6" y="22" width="52" height="8" rx="3" fill="#d97706" {...S} />
      <rect x="12" y="30" width="6" height="28" rx="2" fill="#92400e" {...S} />
      <rect x="46" y="30" width="6" height="28" rx="2" fill="#92400e" {...S} />
      <path d="M18 40h28" stroke="#92400e" strokeWidth="4" />
    </SpriteFrame>);

}

/** Bookshelf prop for indoor levels. */
export function BookshelfProp({ size, className, label = 'Bookshelf' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="8" y="6" width="48" height="52" rx="4" fill="#92400e" {...S} />
      <path d="M8 24h48M8 42h48" stroke="#78350f" strokeWidth="3" />
      <rect x="14" y="10" width="6" height="14" fill="#ef4444" />
      <rect x="22" y="10" width="5" height="14" fill="#3b82f6" />
      <rect x="29" y="12" width="6" height="12" fill="#22c55e" />
      <rect x="14" y="28" width="5" height="14" fill="#f59e0b" />
      <rect x="21" y="28" width="6" height="14" fill="#a855f7" />
      <rect x="40" y="30" width="12" height="12" rx="2" fill="#facc15" />
    </SpriteFrame>);

}

/** Rock cluster filler. */
export function RockProp({ size, className, label = 'Rocks' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M6 56l8-16 12 6 6-14 14 8 12 16z" fill="#78716c" {...S} />
      <path d="M14 40l6 16M32 32l4 24M46 40l4 16" stroke="#57534e" strokeWidth="2" />
    </SpriteFrame>);

}

/** Wooden fence section. */
export function FenceProp({ size, className, label = 'Fence' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M12 22l4-6 4 6v36h-8zM30 22l4-6 4 6v36h-8zM48 22l4-6 4 6v36h-8z" fill="#b45309" {...S} />
      <path d="M8 30h50M8 44h50" stroke="#92400e" strokeWidth="5" />
    </SpriteFrame>);

}

/** Tent / camp prop. */
export function TentProp({ size, className, label = 'Tent' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M4 56L32 12l28 44z" fill="#0d9488" {...S} />
      <path d="M32 12v44" stroke="#0f766e" strokeWidth="2" />
      <path d="M24 56l8-22 8 22z" fill="#134e4a" {...S} />
    </SpriteFrame>);

}

/** Arcade cabinet decor / hub prop. */
export function ArcadeCabinet({ size, className, animated, label = 'Arcade cabinet' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M14 60V12a6 6 0 016-6h24a6 6 0 016 6v48z" fill="#7c3aed" {...S} />
      <rect x="20" y="14" width="24" height="18" rx="3" fill="#0f172a" {...S} strokeWidth="1.5" />
      <path d="M25 26h4v-4h6v4h4" stroke="#22d3ee" strokeWidth="2" fill="none" />
      <rect x="20" y="36" width="24" height="10" rx="3" fill="#a855f7" {...S} strokeWidth="1.5" />
      <circle cx="27" cy="41" r="2.5" fill="#facc15" />
      <circle cx="35" cy="41" r="2.5" fill="#ef4444" />
      <circle cx="41" cy="41" r="2" fill="#22c55e" />
      <rect x="18" y="50" width="28" height="6" rx="2" fill="#4c1d95" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}