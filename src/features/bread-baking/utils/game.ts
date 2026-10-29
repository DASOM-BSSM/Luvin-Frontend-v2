import type {
  BakingAction, BakingDrop, BakingIngredient, BakingOvenResult, BakingOvenZone, BakingRect,
  BakingState, BakingStep,
} from '@/src/features/bread-baking/types';
import {
  createShaping, isShapeDone, judgeShapeSwipe,
} from '@/src/features/bread-baking/utils/shaping';

/** Mission/time are from Figma 5726:2608. Oven gauge tuning is an initial gameplay value. */
export const BAKING_RULES = {
  durationMs: 180_000,
  tickMs: 50,
  targetCount: 3,
  /** The marker crosses the whole gauge in this long; reaching the end burns the loaf. */
  ovenGaugeMs: 4_000,
  /** Gauge fractions: green moves every try, orange flanks it, red fills the rest. */
  ovenGreenWidth: 0.14,
  ovenOrangeWidth: 0.1,
  /** Earliest green start, so the marker always travels a while before the window. */
  ovenGreenMinStart: 0.3,
  toolTravel: 120,
  resultHoldMs: 750,
} as const;

/**
 * 서버 미니게임 code(보상 연동용). 2026-10-30 기준 백엔드에 아직 등록되지 않은 **가정값**이다 —
 * 등록 전에는 `useReportMinigameResult` 가 목록에서 못 찾고 조용히 건너뛴다. 백엔드가 다른 값으로
 * 등록하면 여기만 바꾼다.
 */
export const BAKING_MINIGAME_CODE = 'salt_bread_baking';

export const BAKING_STEPS: readonly BakingStep[] = [
  'prepare', 'flour', 'eggs', 'mix-first', 'butter', 'water', 'mix-second',
  'salt', 'sugar', 'yeast', 'mix-final', 'transfer', 'roll', 'filling',
  'shape', 'sprinkle', 'load', 'bake', 'serve',
];

export function createBakingState(): BakingState {
  return { phase: 'ready', step: 'prepare', remainingMs: BAKING_RULES.durationMs,
    bakedCount: 0, ovenElapsedMs: 0, ovenResult: null,
    ovenGreenStart: BAKING_RULES.ovenGreenMinStart, shaping: createShaping([]) };
}

export function isMixingStep(step: BakingStep): boolean {
  return step === 'mix-first' || step === 'mix-second' || step === 'mix-final';
}

export function getExpectedIngredient(step: BakingStep): BakingIngredient | null {
  if (step === 'filling') return 'butter';
  if (step === 'sprinkle') return 'salt';
  if (['flour', 'eggs', 'water', 'butter', 'salt', 'sugar', 'yeast'].includes(step)) {
    return step as BakingIngredient;
  }
  return null;
}

/** Maps a 0–1 random draw to this try's green start, keeping both orange bands on the gauge. */
export function createOvenGreenStart(random: number): number {
  const { ovenGreenMinStart: min, ovenGreenWidth: green, ovenOrangeWidth: orange } = BAKING_RULES;
  const max = 1 - orange - green;
  return min + Math.min(Math.max(random, 0), 1) * (max - min);
}

export function getOvenProgress(elapsedMs: number): number {
  return Math.min(1, Math.max(0, elapsedMs / BAKING_RULES.ovenGaugeMs));
}

/** red | orange | green | orange | red, as fractions of the gauge that sum to 1. */
export function getOvenGaugeZones(greenStart: number): BakingOvenZone[] {
  const { ovenGreenWidth: green, ovenOrangeWidth: orange } = BAKING_RULES;
  return [
    { kind: 'red', size: greenStart - orange },
    { kind: 'orange', size: orange },
    { kind: 'green', size: green },
    { kind: 'orange', size: orange },
    { kind: 'red', size: Math.max(0, 1 - greenStart - green - orange) },
  ];
}

/** Only green bakes; anything before it is raw, anything after it is burnt. */
export function judgeOvenPull(progress: number, greenStart: number): BakingOvenResult {
  if (progress < greenStart) return 'raw';
  return progress <= greenStart + BAKING_RULES.ovenGreenWidth ? 'baked' : 'burnt';
}

function advance(state: BakingState): BakingState {
  const nextStep = BAKING_STEPS[BAKING_STEPS.indexOf(state.step) + 1];
  return nextStep ? { ...state, step: nextStep, ovenElapsedMs: 0, ovenResult: null } : state;
}

/** Pure state machine: out-of-order ingredients/tools and terminal-state input are ignored. */
export function bakingReducer(state: BakingState, action: BakingAction): BakingState {
  if (action.type === 'restart') return createBakingState();
  if (action.type === 'start') {
    return state.phase === 'ready' ? { ...state, phase: 'playing', step: 'flour' } : state;
  }
  if (state.phase !== 'playing') return state;
  if (action.type === 'tick') {
    if (!Number.isFinite(action.elapsedMs) || action.elapsedMs <= 0) return state;
    const remainingMs = Math.max(0, state.remainingMs - action.elapsedMs);
    if (remainingMs === 0) return { ...state, remainingMs, phase: 'fail' };
    // Preparing the empty bowl is automatic, including an already-mounted pre-fix game.
    if (state.step === 'prepare') return { ...state, remainingMs, step: 'flour' };
    const ovenElapsedMs = state.step === 'bake' ? state.ovenElapsedMs + action.elapsedMs : 0;
    if (state.step === 'serve') {
      const holdMs = state.ovenElapsedMs + action.elapsedMs;
      return holdMs >= BAKING_RULES.resultHoldMs
        ? { ...state, remainingMs, ovenElapsedMs: 0, step: 'flour', ovenResult: null }
        : { ...state, remainingMs, ovenElapsedMs: holdMs };
    }
    // Letting the marker reach the end restarts this loaf; completed loaves remain counted.
    // The burnt loaf is held like a finished one so the player sees why it restarted.
    if (state.step === 'bake' && ovenElapsedMs >= BAKING_RULES.ovenGaugeMs) {
      return { ...state, remainingMs, ovenElapsedMs: 0, step: 'serve', ovenResult: 'burnt' };
    }
    return { ...state, remainingMs, ovenElapsedMs };
  }
  if (action.type === 'ingredient') {
    if (getExpectedIngredient(state.step) !== action.ingredient) return state;
    if (state.step !== 'filling') return advance(state);
    // Shaping starts right after the butter, so its first arrows must arrive with the drop.
    return action.arrows ? { ...advance(state), shaping: createShaping(action.arrows) } : state;
  }
  if (action.type === 'swipe') {
    if (state.step !== 'shape') return state;
    const shaping = judgeShapeSwipe(state.shaping, action.direction);
    if (shaping === state.shaping) return state;
    return isShapeDone(shaping) ? advance({ ...state, shaping }) : { ...state, shaping };
  }
  if (action.type === 'shape-retry') {
    // A failed round keeps the dough and butter; only the arrows start over.
    return state.step === 'shape' && state.shaping.failed
      ? { ...state, shaping: createShaping(action.arrows) } : state;
  }
  if (action.type === 'load') {
    return state.step === 'load' ? { ...advance(state), ovenGreenStart: action.greenStart } : state;
  }
  if (action.type === 'mix') return isMixingStep(state.step) ? advance(state) : state;
  if (action.type === 'remove') {
    if (state.step !== 'bake') return state;
    const ovenResult = judgeOvenPull(getOvenProgress(state.ovenElapsedMs), state.ovenGreenStart);
    if (ovenResult !== 'baked') return { ...state, step: 'serve', ovenElapsedMs: 0, ovenResult };
    const bakedCount = state.bakedCount + 1;
    return { ...state, step: 'serve', ovenElapsedMs: 0, bakedCount, ovenResult: 'baked',
      phase: bakedCount >= BAKING_RULES.targetCount ? 'success' : 'playing' };
  }
  if (action.type === 'serve') {
    if (state.step !== 'serve') return state;
    return { ...state, step: 'flour', ovenElapsedMs: 0, ovenResult: null };
  }
  return state.step === action.type ? advance(state) : state;
}

export function isDropInside(drop: BakingDrop, target: BakingRect): boolean {
  return drop.x >= target.x && drop.x <= target.x + target.width
    && drop.y >= target.y && drop.y <= target.y + target.height;
}

export function formatBakingTime(remainingMs: number): string {
  const seconds = Math.ceil(Math.max(0, remainingMs) / 1_000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
