import type { BakingDirection, BakingShaping } from '@/src/features/bread-baking/types';

/** User-approved counts (5 arrows, fail at 3 misses); swipe distance is an initial value. */
export const SHAPING_RULES = {
  arrowCount: 5,
  missLimit: 3,
  /** Shorter drags are ignored instead of judged, so a stray tap is not a miss. */
  swipeMinDistance: 40,
} as const;

const DIRECTIONS: readonly BakingDirection[] = ['up', 'down', 'left', 'right'];

/** `random` returns 0–1. No arrow repeats the previous one, so every new arrow visibly changes. */
export function createShapeArrows(random: () => number): BakingDirection[] {
  const arrows: BakingDirection[] = [];
  while (arrows.length < SHAPING_RULES.arrowCount) {
    const choices = DIRECTIONS.filter((direction) => direction !== arrows[arrows.length - 1]);
    arrows.push(choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))]);
  }
  return arrows;
}

export function createShaping(arrows: BakingDirection[]): BakingShaping {
  return { arrows, index: 0, hits: 0, misses: 0, failed: false };
}

/** Dominant axis wins; null when the drag is too short to count. Screen y grows downward. */
export function getSwipeDirection(dx: number, dy: number): BakingDirection | null {
  if (Math.hypot(dx, dy) < SHAPING_RULES.swipeMinDistance) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

/** Every swipe consumes one arrow, right or wrong; reaching the miss limit fails the round. */
export function judgeShapeSwipe(shaping: BakingShaping, direction: BakingDirection): BakingShaping {
  if (shaping.failed || shaping.index >= shaping.arrows.length) return shaping;
  const isHit = shaping.arrows[shaping.index] === direction;
  const misses = shaping.misses + (isHit ? 0 : 1);
  return { ...shaping, index: shaping.index + 1, hits: shaping.hits + (isHit ? 1 : 0), misses,
    failed: misses >= SHAPING_RULES.missLimit };
}

export function isShapeDone(shaping: BakingShaping): boolean {
  return !shaping.failed && shaping.index >= shaping.arrows.length;
}
