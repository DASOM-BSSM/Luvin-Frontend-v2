/**
 * 아래에서 올라오는 시트를 손잡이로 끌 때의 계산. UI 스레드(worklet)에서 불린다.
 *
 * 끈 위치는 숫자 하나(offset)로 다룬다 — 양수면 원래 높이보다 그만큼 위로 늘어난 것,
 * 음수면 그만큼 아래로 내려간 것이다.
 */

export type SheetSnap = 'closed' | 'collapsed' | 'expanded';

/** 이보다 빠르게(px/s) 튕기면 놓은 위치와 상관없이 그 방향으로 한 단계 옮긴다. */
const FLING_VELOCITY = 800;

/** 원래 높이의 이 비율보다 더 내리고 놓으면 닫는다. */
const CLOSE_RATIO = 0.25;

/** 위로는 `maxExpand` 까지, 아래로는 시트 높이만큼까지만 끌린다. */
export function clampSheetOffset(offset: number, maxExpand: number, sheetHeight: number): number {
  'worklet';
  return Math.min(Math.max(offset, -sheetHeight), Math.max(maxExpand, 0));
}

/** 손을 뗀 위치와 속도(아래가 +)로 시트가 갈 자리를 정한다. */
export function resolveSheetSnap(
  offset: number,
  velocityY: number,
  maxExpand: number,
  sheetHeight: number,
): SheetSnap {
  'worklet';
  if (velocityY > FLING_VELOCITY) return offset > 0 ? 'collapsed' : 'closed';
  if (velocityY < -FLING_VELOCITY) return offset < 0 ? 'collapsed' : 'expanded';
  if (offset < -sheetHeight * CLOSE_RATIO) return 'closed';
  if (maxExpand > 0 && offset > maxExpand / 2) return 'expanded';
  return 'collapsed';
}
