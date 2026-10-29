export type BakingIngredient = 'flour' | 'eggs' | 'water' | 'butter' | 'salt' | 'sugar' | 'yeast';

export type BakingStep =
  | 'prepare'
  | 'flour' | 'eggs' | 'mix-first'
  | 'butter' | 'water' | 'mix-second'
  | 'salt' | 'sugar' | 'yeast' | 'mix-final'
  | 'transfer' | 'roll' | 'filling' | 'shape' | 'sprinkle'
  | 'load' | 'bake' | 'serve';

/** Arrow/swipe directions for shaping. Diagonals are left out for now (initial gameplay value). */
export type BakingDirection = 'up' | 'down' | 'left' | 'right';

/** One round of arrow shaping; a failed round is retried with new arrows, keeping the dough. */
export interface BakingShaping {
  arrows: BakingDirection[];
  /** Index of the arrow currently shown. */
  index: number;
  hits: number;
  misses: number;
  /** Too many misses: the NOTICE modal is up and the clock is paused. */
  failed: boolean;
}

/** How the last loaf left the oven; drives the serve-step asset (Figma 7975:2356). */
export type BakingOvenResult = 'baked' | 'burnt' | 'raw';

export interface BakingState {
  phase: 'ready' | 'playing' | 'success' | 'fail';
  step: BakingStep;
  remainingMs: number;
  bakedCount: number;
  ovenElapsedMs: number;
  ovenResult: BakingOvenResult | null;
  /** Gauge fraction where this try's green zone begins; drawn per try on `load`. */
  ovenGreenStart: number;
  shaping: BakingShaping;
}

export interface BakingOvenZone {
  kind: 'red' | 'orange' | 'green';
  /** Fraction of the gauge track. */
  size: number;
}

export type BakingAction =
  | { type: 'start' }
  | { type: 'restart' }
  /** The filling (butter) drop carries the first shaping arrows, since the reducer has no randomness. */
  | { type: 'ingredient'; ingredient: BakingIngredient; arrows?: BakingDirection[] }
  | { type: 'prepare' | 'mix' | 'transfer' | 'roll' | 'remove' | 'serve' }
  | { type: 'swipe'; direction: BakingDirection }
  | { type: 'shape-retry'; arrows: BakingDirection[] }
  | { type: 'load'; greenStart: number }
  | { type: 'tick'; elapsedMs: number };

export interface BakingRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BakingDrop {
  x: number;
  y: number;
  distance: number;
}
