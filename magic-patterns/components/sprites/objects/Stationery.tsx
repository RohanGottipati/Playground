import React from 'react';
import { SpriteFrame, INK } from '../SpriteFrame';
import type { SpriteProps } from '../../../types/game';

const S = { stroke: INK, strokeWidth: 2 };

/** Pencil — long thin platform or spike. */
export function PencilObject({ size, className, label = 'Pencil' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M6 40l6-8 34 22-6 8z" fill="#f59e0b" {...S} />
      <path d="M6 40l-4 12 12-4z" fill="#fde68a" {...S} />
      <path d="M2 52l5-2-1-4z" fill={INK} />
      <path d="M46 54l8-10 8 6-8 10z" fill="#f472b6" {...S} />
      <path d="M44 44l4 6" stroke="#b45309" strokeWidth="2" />
    </SpriteFrame>);

}

/** Pen — writing tool / dart projectile. */
export function PenObject({ size, className, label = 'Pen' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M10 54l6-6 32-32 6 6-32 32z" fill="#1d4ed8" {...S} />
      <path d="M8 56l4-8 4 4z" fill="#1e293b" {...S} strokeWidth="1.5" />
      <path d="M44 12l8 8" {...S} strokeWidth="3" />
      <path d="M50 6l8 8-6 6-8-8z" fill="#93c5fd" {...S} />
    </SpriteFrame>);

}

/** Eraser — deletes blocks it touches. */
export function EraserObject({ size, className, label = 'Eraser' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M10 40l22-22 22 22-12 12H22z" fill="#f472b6" {...S} />
      <path d="M22 52l22-22" stroke="#be185d" strokeWidth="2" />
      <path d="M32 18l22 22-6 6-22-22z" fill="#f9a8d4" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Ruler — measuring platform with tick marks. */
export function RulerObject({ size, className, label = 'Ruler' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="2" y="26" width="60" height="14" rx="3" fill="#fbbf24" {...S} />
      {[10, 18, 26, 34, 42, 50, 58].map((x, i) =>
      <path key={x} d={`M${x} 26v${i % 2 === 0 ? 8 : 5}`} stroke={INK} strokeWidth="2" />
      )}
    </SpriteFrame>);

}

/** Scissors — cuts ropes and vines. */
export function ScissorsObject({ size, className, label = 'Scissors' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M18 8l28 34M46 8L18 42" fill="none" {...S} strokeWidth="4" />
      <circle cx="16" cy="50" r="8" fill="none" stroke="#ef4444" strokeWidth="4" />
      <circle cx="48" cy="50" r="8" fill="none" stroke="#ef4444" strokeWidth="4" />
      <circle cx="32" cy="30" r="3" fill="#94a3b8" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Stapler — clamps platforms shut. */
export function StaplerObject({ size, className, label = 'Stapler' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M6 44h52a4 4 0 014 4v6H2v-6a4 4 0 014-4z" fill="#334155" {...S} />
      <path d="M8 28h44a6 6 0 016 6v8H8a6 6 0 01-6-6v-2a6 6 0 016-6z" fill="#dc2626" {...S} />
      <path d="M14 34h30" stroke="#fca5a5" strokeWidth="3" />
    </SpriteFrame>);

}

/** Notebook — save point. */
export function NotebookObject({ size, className, label = 'Notebook' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="12" y="8" width="42" height="48" rx="4" fill="#f8fafc" {...S} />
      <rect x="8" y="8" width="10" height="48" rx="4" fill="#0d9488" {...S} />
      <path d="M24 22h22M24 32h22M24 42h14" stroke="#94a3b8" strokeWidth="2.5" />
      <circle cx="13" cy="18" r="2" fill="#f8fafc" />
      <circle cx="13" cy="32" r="2" fill="#f8fafc" />
      <circle cx="13" cy="46" r="2" fill="#f8fafc" />
    </SpriteFrame>);

}

/** Book — stackable block. */
export function BookObject({ size, className, label = 'Book' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <path d="M8 16h20a6 6 0 016 6v30a6 6 0 00-6-4H8z" fill="#ef4444" {...S} />
      <path d="M56 16H36a6 6 0 00-6 6v30a6 6 0 016-4h20z" fill="#dc2626" {...S} />
      <path d="M32 22v28" {...S} />
      <path d="M14 28h12M38 28h12M14 36h12M38 36h12" stroke="#fca5a5" strokeWidth="2" />
    </SpriteFrame>);

}

/** Backpack — inventory expansion pickup. */
export function BackpackObject({ size, className, animated, label = 'Backpack' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="bob" label={label}>
      <path d="M14 24a18 18 0 0136 0v28a6 6 0 01-6 6H20a6 6 0 01-6-6z" fill="#16a34a" {...S} />
      <path d="M24 24a8 8 0 0116 0" fill="none" {...S} strokeWidth="3" />
      <rect x="20" y="38" width="24" height="14" rx="3" fill="#15803d" {...S} strokeWidth="1.5" />
      <path d="M22 44h20" stroke="#86efac" strokeWidth="3" />
    </SpriteFrame>);

}

/** Calculator — puzzle keypad object. */
export function CalculatorObject({ size, className, label = 'Calculator' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="14" y="4" width="36" height="56" rx="5" fill="#334155" {...S} />
      <rect x="19" y="10" width="26" height="12" rx="2" fill="#a7f3d0" {...S} strokeWidth="1.5" />
      {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) =>
      <rect key={`${r}-${c}`} x={20 + c * 9} y={28 + r * 9} width="7" height="7" rx="1.5" fill="#94a3b8" />
      )
      )}
    </SpriteFrame>);

}

/** Paperclip — grapple hook item. */
export function PaperclipObject({ size, className, animated, label = 'Paperclip' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <path
        d="M22 50V20a10 10 0 0120 0v28a16 16 0 01-32 0V22"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="6" />

      <path d="M22 50V20a10 10 0 0120 0v28a16 16 0 01-32 0V22" fill="none" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Sticky note — hint marker. */
export function StickyNoteObject({ size, className, animated, label = 'Sticky note' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="sway" label={label}>
      <path d="M10 10h44v34l-10 10H10z" fill="#fde047" {...S} />
      <path d="M44 54V44h10z" fill="#facc15" {...S} />
      <path d="M18 22h28M18 30h22M18 38h16" stroke="#a16207" strokeWidth="2.5" />
    </SpriteFrame>);

}

/** Tape roll — sticky wall surface. */
export function TapeRollObject({ size, className, animated, label = 'Tape roll' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <circle cx="32" cy="32" r="24" fill="#fcd34d" {...S} />
      <circle cx="32" cy="32" r="10" fill="#f8fafc" {...S} />
      <path d="M56 32l8 6-8 4z" fill="#fef3c7" {...S} strokeWidth="1.5" />
    </SpriteFrame>);

}

/** Globe — world / level select object. */
export function GlobeObject({ size, className, animated, label = 'Globe' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="spin" label={label}>
      <circle cx="32" cy="28" r="20" fill="#38bdf8" {...S} />
      <path d="M20 18c8 4 16 4 24 0M18 34c10 4 20 4 28 0" fill="none" stroke="#0284c7" strokeWidth="2" />
      <path d="M22 14c8 8 8 20 0 28M42 14c-8 8-8 20 0 28" fill="none" stroke="#0284c7" strokeWidth="2" />
      <path d="M24 22h10l4 6-6 4z" fill="#4ade80" {...S} strokeWidth="1.5" />
      <path d="M32 48v8M22 60h20" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Alarm clock — starts a timed challenge. */
export function AlarmClockObject({ size, className, animated, label = 'Alarm clock' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} animated={animated} motionStyle="pulse" label={label}>
      <circle cx="32" cy="34" r="22" fill="#ef4444" {...S} />
      <circle cx="32" cy="34" r="16" fill="#fef3c7" {...S} strokeWidth="1.5" />
      <path d="M32 34V22M32 34l8 6" fill="none" {...S} strokeWidth="3" />
      <circle cx="14" cy="12" r="8" fill="#dc2626" {...S} />
      <circle cx="50" cy="12" r="8" fill="#dc2626" {...S} />
      <path d="M20 54l-4 8M44 54l4 8" {...S} strokeWidth="3" />
    </SpriteFrame>);

}

/** Whiteboard — tutorial surface. */
export function WhiteboardObject({ size, className, label = 'Whiteboard' }: SpriteProps) {
  return (
    <SpriteFrame size={size} className={className} label={label}>
      <rect x="4" y="8" width="56" height="38" rx="4" fill="#f8fafc" {...S} />
      <path d="M12 18h24M12 26h32M12 34h18" stroke="#3b82f6" strokeWidth="2.5" />
      <path d="M4 46h56" {...S} strokeWidth="3" />
      <path d="M16 46l-4 12M48 46l4 12" {...S} strokeWidth="3" />
    </SpriteFrame>);

}
