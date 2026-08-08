import React from 'react';
import { motion } from 'framer-motion';
import type { SpriteMotion } from '../../types/game';

interface SpriteFrameProps {
  size?: number;
  className?: string;
  animated?: boolean;
  motionStyle?: SpriteMotion;
  viewBox?: string;
  label?: string | null;
  children: React.ReactNode;
}

const loops: Record<SpriteMotion, Record<string, unknown>> = {
  none: {},
  bob: {
    animate: { y: [0, -3, 0] },
    transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
  },
  float: {
    animate: { y: [0, -6, 0], rotate: [-2, 2, -2] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  },
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 3, repeat: Infinity, ease: 'linear' }
  },
  pulse: {
    animate: { scale: [1, 1.08, 1] },
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
  },
  sway: {
    animate: { rotate: [-5, 5, -5] },
    transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
  }
};

/**
 * Shared wrapper for every sprite: fixed square SVG canvas, crisp outlines and
 * an optional idle motion loop. Respects prefers-reduced-motion via Framer.
 */
export function SpriteFrame({
  size = 64,
  className = '',
  animated = false,
  motionStyle = 'bob',
  viewBox = '0 0 64 64',
  label,
  children
}: SpriteFrameProps) {
  const loop = animated ? loops[motionStyle] : {};
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={`overflow-visible ${className}`}
      role={label ? 'img' : 'presentation'}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...loop}>

      {children}
    </motion.svg>);

}

/** Shared ink colour so every sprite reads as one hand-drawn set. */
export const INK = '#1b1b23';
