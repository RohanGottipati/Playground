import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Car — moving platform / obstacle. */
export function CarObject({ size, className, animated, label = 'Car' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M6 44V34l8-2 8-12h20l8 12 8 2v10z" fill="#dc2626" {...S} />
      <path d="M24 22h14l5 10H20z" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <circle cx="18" cy="46" r="7" fill="#1f2937" {...S} />
      <circle cx="46" cy="46" r="7" fill="#1f2937" {...S} />
      <circle cx="18" cy="46" r="2.5" fill="#94a3b8" />
      <circle cx="46" cy="46" r="2.5" fill="#94a3b8" />
      <circle cx="10" cy="36" r="2" fill="#fde047" />
    </SpriteFrame>);

}

/** Bus — long moving platform. */
export function BusObject({ size, className, animated, label = 'Bus' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="2" y="16" width="60" height="30" rx="6" fill="#f59e0b" {...S} />
      <rect x="8" y="22" width="12" height="10" rx="2" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <rect x="24" y="22" width="12" height="10" rx="2" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <rect x="40" y="22" width="16" height="10" rx="2" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <circle cx="16" cy="48" r="7" fill="#1f2937" {...S} />
      <circle cx="46" cy="48" r="7" fill="#1f2937" {...S} />
      <path d="M8 38h48" stroke="#b45309" strokeWidth="2" />
    </SpriteFrame>);

}

/** Truck — heavy vehicle platform. */
export function TruckObject({ size, className, animated, label = 'Truck' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="2" y="18" width="34" height="26" rx="3" fill="#0ea5e9" {...S} />
      <path d="M36 26h12l10 10v8H36z" fill="#0369a1" {...S} />
      <rect x="40" y="28" width="10" height="8" rx="2" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <circle cx="16" cy="48" r="7" fill="#1f2937" {...S} />
      <circle cx="48" cy="48" r="7" fill="#1f2937" {...S} />
      <path d="M8 24h20M8 32h20" stroke="#7dd3fc" strokeWidth="2" />
    </SpriteFrame>);

}

/** Train carriage — rail-bound moving platform. */
export function TrainObject({ size, className, animated, label = 'Train' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <rect x="6" y="16" width="46" height="26" rx="5" fill="#16a34a" {...S} />
      <rect x="12" y="22" width="12" height="10" rx="2" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <rect x="30" y="22" width="12" height="10" rx="2" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <rect x="44" y="8" width="10" height="10" rx="3" fill="#475569" {...S} />
      <circle cx="18" cy="46" r="6" fill="#1f2937" {...S} />
      <circle cx="40" cy="46" r="6" fill="#1f2937" {...S} />
      <path d="M2 56h60" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Aeroplane — sky background / ride. */
export function PlaneObject({ size, className, animated, label = 'Aeroplane' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M4 34c0-4 4-6 10-6h28l14-8-6 14 6 14-14-8H14c-6 0-10-2-10-6z" fill="#f8fafc" {...S} />
      <path d="M20 28l-6-16h8l10 16M20 40l-6 14h8l10-14" fill="#cbd5e1" {...S} />
      <circle cx="12" cy="34" r="3" fill="#38bdf8" />
    </SpriteFrame>);

}

/** Rocket — launch mechanic. */
export function RocketObject({ size, className, animated, label = 'Rocket' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M32 2c10 10 12 22 12 34v8H20v-8c0-12 2-24 12-34z" fill="#f8fafc" {...S} />
      <circle cx="32" cy="24" r="6" fill="#38bdf8" {...S} />
      <path d="M20 34l-10 16 10-4zM44 34l10 16-10-4z" fill="#dc2626" {...S} />
      <path d="M26 44h12l-6 18z" fill="#f97316" {...S} />
    </SpriteFrame>);

}

/** Boat — floats on water sections. */
export function BoatObject({ size, className, animated, label = 'Boat' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M6 38h52l-8 14H14z" fill="#b45309" {...S} />
      <path d="M32 36V8l18 26z" fill="#f8fafc" {...S} />
      <path d="M30 36V12L16 36z" fill="#e2e8f0" {...S} />
      <path d="M4 54c6-4 10 4 16 0s10 4 16 0 10 4 16 0" fill="none" stroke="#38bdf8" strokeWidth="3" />
    </SpriteFrame>);

}

/** Scooter — light ride object. */
export function ScooterObject({ size, className, animated, label = 'Scooter' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M14 48h28l8-34" fill="none" stroke="#0ea5e9" strokeWidth="4" />
      <path d="M42 12h14" {...S} strokeWidth="4" />
      <circle cx="14" cy="50" r="8" fill="none" {...S} strokeWidth="4" />
      <circle cx="48" cy="50" r="8" fill="none" {...S} strokeWidth="4" />
      <path d="M14 48h30" stroke="#0369a1" strokeWidth="4" />
    </SpriteFrame>);

}

/** Motorcycle — fast vehicle. */
export function MotorcycleObject({ size, className, animated, label = 'Motorcycle' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <circle cx="14" cy="44" r="12" fill="none" {...S} strokeWidth="4" />
      <circle cx="50" cy="44" r="12" fill="none" {...S} strokeWidth="4" />
      <path d="M14 44l10-12h16l10 12M24 32l-4-8h10" fill="none" stroke="#dc2626" strokeWidth="4" />
      <path d="M40 24h10l4 8" fill="none" {...S} strokeWidth="3" />
      <path d="M26 30h16l-2 6H28z" fill="#1f2937" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Helicopter — hovering ride / boss. */
export function HelicopterObject({ size, className, animated, label = 'Helicopter' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M4 10h56" {...S} strokeWidth="3" />
      <path d="M32 10v8" {...S} strokeWidth="3" />
      <path d="M14 30a16 12 0 0130 0v10H20a6 6 0 01-6-6z" fill="#f59e0b" {...S} />
      <circle cx="24" cy="30" r="6" fill="#bae6fd" {...S} strokeWidth="1.5" />
      <path d="M44 34h16M56 30v10" {...S} strokeWidth="3" />
      <path d="M16 44h26" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Hot air balloon — slow vertical lift. */
export function HotAirBalloonObject({ size, className, animated, label = 'Hot air balloon' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="float" label={label}>
      <path d="M32 2a22 24 0 0114 42H18A22 24 0 0132 2z" fill="#ef4444" {...S} />
      <path d="M24 4c-4 12-4 28 0 40M40 4c4 12 4 28 0 40" fill="none" stroke="#fbbf24" strokeWidth="3" />
      <path d="M22 44l4 8M42 44l-4 8" {...S} strokeWidth="1.5" />
      <rect x="24" y="50" width="16" height="10" rx="3" fill="#b45309" {...S} />
    </SpriteFrame>);

}

/** Shopping trolley — pushable container. */
export function ShoppingCartObject({ size, className, label = 'Shopping trolley' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M12 16h44l-6 24H18z" fill="none" {...S} strokeWidth="3" />
      <path d="M16 24h38M20 32h32M26 17v22M38 17v22" stroke="#94a3b8" strokeWidth="2" />
      <path d="M12 16L6 8H2" fill="none" {...S} strokeWidth="3" />
      <circle cx="22" cy="50" r="6" fill="#475569" {...S} />
      <circle cx="46" cy="50" r="6" fill="#475569" {...S} />
    </SpriteFrame>);

}

/** Wheelbarrow — carries objects. */
export function WheelbarrowObject({ size, className, label = 'Wheelbarrow' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M10 20h40l-8 20H18z" fill="#0ea5e9" {...S} />
      <path d="M50 20l10-6" {...S} strokeWidth="4" />
      <path d="M18 40l-6 14M42 40l4 10" {...S} strokeWidth="3" />
      <circle cx="20" cy="50" r="8" fill="#334155" {...S} />
    </SpriteFrame>);

}

/** Traffic cone — marker / small obstacle. */
export function TrafficConeObject({ size, className, label = 'Traffic cone' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M32 6l16 44H16z" fill="#f97316" {...S} />
      <path d="M22 34h20M25 26h14" stroke="#f8fafc" strokeWidth="5" />
      <rect x="8" y="50" width="48" height="8" rx="3" fill="#ea580c" {...S} />
    </SpriteFrame>);

}

/** Traffic light — timed gate signal. */
export function TrafficLightObject({ size, className, animated, label = 'Traffic light' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <rect x="20" y="4" width="24" height="42" rx="6" fill="#334155" {...S} />
      <circle cx="32" cy="14" r="6" fill="#ef4444" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="26" r="6" fill="#facc15" {...S} strokeWidth="1.5" />
      <circle cx="32" cy="38" r="6" fill="#22c55e" {...S} strokeWidth="1.5" />
      <path d="M32 46v14M22 60h20" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Tyre — bouncy rolling object. */
export function TyreObject({ size, className, animated, label = 'Tyre' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <circle cx="32" cy="32" r="26" fill="#1f2937" {...S} />
      <circle cx="32" cy="32" r="12" fill="#94a3b8" {...S} />
      <circle cx="32" cy="32" r="4" fill="#475569" />
      <path d="M32 6v6M32 52v6M6 32h6M52 32h6M14 14l4 4M46 46l4 4M50 14l-4 4M18 46l-4 4" stroke="#4b5563" strokeWidth="3" />
    </SpriteFrame>);

}

/** Fuel pump — refuels jetpacks and vehicles. */
export function FuelPumpObject({ size, className, label = 'Fuel pump' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="10" y="10" width="30" height="48" rx="4" fill="#dc2626" {...S} />
      <rect x="16" y="16" width="18" height="12" rx="2" fill="#fef3c7" {...S} strokeWidth="1.5" />
      <path d="M40 24h8a4 4 0 014 4v18a4 4 0 01-8 0V34h-4" fill="none" {...S} strokeWidth="3" />
      <path d="M18 38h14" stroke="#fca5a5" strokeWidth="3" />
    </SpriteFrame>);

}
