import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Toilet roll — rolling object / soft block. */
export function ToiletRollObject({ size, className, animated, label = 'Toilet roll' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <rect x="14" y="16" width="36" height="34" rx="6" fill="#f8fafc" {...S} />
      <ellipse cx="32" cy="16" rx="18" ry="7" fill="#e2e8f0" {...S} />
      <ellipse cx="32" cy="16" rx="7" ry="3" fill="#a8a29e" />
      <path d="M50 30c6 2 8 14 8 22" fill="none" stroke="#f1f5f9" strokeWidth="6" />
      <path d="M50 30c6 2 8 14 8 22" fill="none" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Toothbrush — small pickup. */
export function ToothbrushObject({ size, className, label = 'Toothbrush' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M12 52l30-30" {...S} strokeWidth="7" />
      <path d="M12 52l30-30" stroke="#38bdf8" strokeWidth="5" />
      <path d="M42 22l10-10 6 6-10 10z" fill="#f8fafc" {...S} />
      <path d="M46 14l4 4M50 12l4 4" stroke="#cbd5e1" strokeWidth="2" />
    </SpriteFrame>);

}

/** Soap bar — slippery surface. */
export function SoapObject({ size, className, label = 'Soap bar' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="8" y="24" width="48" height="22" rx="10" fill="#a7f3d0" {...S} />
      <path d="M16 32c8-4 24-4 32 0" stroke="#fff" strokeWidth="3" fill="none" />
      <circle cx="52" cy="16" r="5" fill="#e0f2fe" {...S} strokeWidth="1.5" />
      <circle cx="44" cy="10" r="3" fill="#e0f2fe" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Towel — hangable rope-like object. */
export function TowelObject({ size, className, animated, label = 'Towel' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M4 10h56" {...S} strokeWidth="3" />
      <path d="M14 10h36v40c0 4-4 6-8 4-6-2-6-6-12-6s-8 4-12 4-4-4-4-8z" fill="#f472b6" {...S} />
      <path d="M14 22h36M14 30h36" stroke="#fbcfe8" strokeWidth="3" />
    </SpriteFrame>);

}

/** Bathtub — water container. */
export function BathtubObject({ size, className, label = 'Bathtub' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M6 28h52v14a10 10 0 01-10 10H16A10 10 0 016 42z" fill="#f8fafc" {...S} />
      <path d="M10 34c8 4 16 4 22 0s14-4 22 0" fill="none" stroke="#38bdf8" strokeWidth="4" />
      <path d="M56 28V18h-8" fill="none" {...S} strokeWidth="3" />
      <path d="M14 52l-2 8M50 52l2 8" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Washing machine — spinning hazard drum. */
export function WashingMachineObject({ size, className, animated, label = 'Washing machine' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="10" y="8" width="44" height="50" rx="5" fill="#e2e8f0" {...S} />
      <circle cx="32" cy="36" r="15" fill="#94a3b8" {...S} />
      <circle cx="32" cy="36" r="10" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <path d="M16 16h20" stroke="#94a3b8" strokeWidth="3" />
      <circle cx="46" cy="16" r="3" fill="#22c55e" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Laundry basket — container for carrying items. */
export function LaundryBasketObject({ size, className, label = 'Laundry basket' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M12 22h40l-5 34H17z" fill="#a78bfa" {...S} />
      <path d="M16 32h32M15 42h34" stroke="#7c3aed" strokeWidth="2" />
      <path d="M20 22v34M32 22v34M44 22v34" stroke="#7c3aed" strokeWidth="2" />
      <path d="M22 20a10 6 0 0120 0" fill="#f8fafc" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Iron — heavy crushing object. */
export function IronObject({ size, className, label = 'Iron' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M6 44h52l-4 10H10z" fill="#94a3b8" {...S} />
      <path d="M12 44c0-14 10-20 26-20h16v20z" fill="#334155" {...S} />
      <path d="M22 24a12 8 0 0122 0" fill="none" {...S} strokeWidth="4" />
    </SpriteFrame>);

}

/** Bin — hides the player / stores items. */
export function TrashBinObject({ size, className, label = 'Bin' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M14 20h36l-4 38H18z" fill="#22c55e" {...S} />
      <rect x="10" y="12" width="44" height="8" rx="3" fill="#16a34a" {...S} />
      <rect x="26" y="6" width="12" height="6" rx="2" fill="#15803d" {...S} />
      <path d="M24 28v22M32 28v22M40 28v22" stroke="#15803d" strokeWidth="2" />
    </SpriteFrame>);

}

/** Candle — light source with a timer. */
export function CandleObject({ size, className, animated, label = 'Candle' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="22" y="22" width="20" height="32" rx="4" fill="#fef3c7" {...S} />
      <path d="M32 22V16" {...S} />
      <path d="M32 4c6 6 6 8 6 11a6 6 0 01-12 0c0-3 0-5 6-11z" fill="#f97316" {...S} />
      <ellipse cx="32" cy="56" rx="18" ry="5" fill="#94a3b8" {...S} />
    </SpriteFrame>);

}

/** Wallet — currency container. */
export function WalletObject({ size, className, label = 'Wallet' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="8" y="18" width="48" height="30" rx="5" fill="#78350f" {...S} />
      <path d="M8 30h48" stroke="#92400e" strokeWidth="2" />
      <rect x="36" y="28" width="24" height="12" rx="3" fill="#b45309" {...S} />
      <circle cx="46" cy="34" r="3" fill="#facc15" {...S} strokeWidth="1.5" />
      <path d="M18 14h20v4H18z" fill="#4ade80" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Key ring — multi-key pickup. */
export function KeyRingObject({ size, className, animated, label = 'Key ring' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <circle cx="32" cy="16" r="10" fill="none" stroke="#94a3b8" strokeWidth="4" />
      <path d="M26 24l-8 30h8l4-24z" fill="#facc15" {...S} />
      <path d="M38 24l8 30h-8l-4-24z" fill="#f59e0b" {...S} />
      <path d="M20 44h6M42 44h-6" stroke={INK} strokeWidth="2" />
    </SpriteFrame>);

}

/** Gift box — reward container. */
export function GiftBoxObject({ size, className, animated, label = 'Gift box' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="10" y="24" width="44" height="32" rx="4" fill="#ef4444" {...S} />
      <rect x="6" y="16" width="52" height="10" rx="3" fill="#dc2626" {...S} />
      <path d="M32 16v40" stroke="#fde047" strokeWidth="5" />
      <path d="M6 22h52" stroke="#fde047" strokeWidth="5" />
      <path d="M32 16c-8-2-12-12-4-12 4 0 4 8 4 12 0-4 0-12 4-12 8 0 4 10-4 12z" fill="#fde047" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Birthday cake — big reward object. */
export function CakeObject({ size, className, animated, label = 'Birthday cake' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <path d="M10 36h44v18a4 4 0 01-4 4H14a4 4 0 01-4-4z" fill="#f472b6" {...S} />
      <path d="M10 40c6 6 12-4 18 2s10-4 16 0 6 2 10-2" fill="none" stroke="#f8fafc" strokeWidth="4" />
      <rect x="20" y="24" width="4" height="12" rx="2" fill="#38bdf8" {...S} strokeWidth="1.5" />
      <rect x="40" y="24" width="4" height="12" rx="2" fill="#38bdf8" {...S} strokeWidth="1.5" />
      <path d="M22 24c-2-4 0-6 0-6s2 2 0 6zM42 24c-2-4 0-6 0-6s2 2 0 6z" fill="#f97316" {...S} strokeWidth="1" />
    </SpriteFrame>);

}

/** Party balloons — lift bundle. */
export function PartyBalloonsObject({ size, className, animated, label = 'Party balloons' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <ellipse cx="20" cy="20" rx="12" ry="14" fill="#ef4444" {...S} />
      <ellipse cx="42" cy="16" rx="11" ry="13" fill="#38bdf8" {...S} />
      <ellipse cx="32" cy="32" rx="10" ry="12" fill="#facc15" {...S} />
      <path d="M20 34c2 10-4 14 0 24M42 29c-2 12 2 16 0 29M32 44c0 8 0 10 0 16" fill="none" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Party hat — cosmetic cone. */
export function PartyHatObject({ size, className, animated, label = 'Party hat' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M32 4l18 46H14z" fill="#a855f7" {...S} />
      <path d="M22 34h20M18 44h28" stroke="#fde047" strokeWidth="3" />
      <circle cx="32" cy="4" r="5" fill="#f472b6" {...S} strokeWidth="1.5" />
      <ellipse cx="32" cy="52" rx="20" ry="5" fill="#7e22ce" {...S} />
    </SpriteFrame>);

}

/** Fire extinguisher — puts out fire hazards. */
export function ExtinguisherObject({ size, className, label = 'Fire extinguisher' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="18" y="18" width="26" height="40" rx="8" fill="#dc2626" {...S} />
      <rect x="26" y="8" width="10" height="10" rx="3" fill="#334155" {...S} />
      <path d="M36 12h12l-4 8" fill="none" {...S} strokeWidth="3" />
      <rect x="22" y="30" width="18" height="12" rx="2" fill="#fef3c7" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Post box — level mail / message object. */
export function MailboxObject({ size, className, label = 'Post box' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M14 22h36v22H14z" fill="#3b82f6" {...S} />
      <path d="M14 22a18 10 0 0136 0" fill="#2563eb" {...S} />
      <rect x="22" y="28" width="20" height="4" rx="2" fill="#f8fafc" {...S} strokeWidth="1.5" />
      <path d="M30 44v14M24 60h14" {...S} strokeWidth="3" />
      <path d="M50 24l8-6v10z" fill="#ef4444" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Piggy bank — coin storage. */
export function PiggyBankObject({ size, className, animated, label = 'Piggy bank' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <ellipse cx="32" cy="34" rx="24" ry="18" fill="#f9a8d4" {...S} />
      <circle cx="52" cy="32" r="7" fill="#f472b6" {...S} />
      <circle cx="54" cy="32" r="1.5" fill={INK} />
      <path d="M46 24l4-8 4 8z" fill="#f472b6" {...S} strokeWidth="1.5" />
      <path d="M24 28h14" stroke="#be185d" strokeWidth="4" />
      <path d="M16 50v6M28 52v6M40 50v6" {...S} strokeWidth="4" />
    </SpriteFrame>);

}
