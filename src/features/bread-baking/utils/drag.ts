import type { BakingRect } from '@/src/features/bread-baking/types';

interface DragPoint {
  x: number;
  y: number;
}

/** Length of a movement segment inside the work area, including sparse/coalesced events. */
export function measureWorkDistance(from: DragPoint, to: DragPoint, area?: BakingRect): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (!area || length === 0) return length;

  let enter = 0;
  let exit = 1;
  const axes = [
    { start: from.x, delta: dx, min: area.x, max: area.x + area.width },
    { start: from.y, delta: dy, min: area.y, max: area.y + area.height },
  ];
  for (const axis of axes) {
    if (axis.delta === 0) {
      if (axis.start < axis.min || axis.start > axis.max) return 0;
      continue;
    }
    const first = (axis.min - axis.start) / axis.delta;
    const last = (axis.max - axis.start) / axis.delta;
    enter = Math.max(enter, Math.min(first, last));
    exit = Math.min(exit, Math.max(first, last));
    if (enter >= exit) return 0;
  }
  return length * (exit - enter);
}

/** One touch on a sprite, in GameFrame-local coordinates (same space as `bakingLayout`). */
export interface DragTouch {
  /** Finger page position at grant; later page positions are measured against it. */
  pageX: number;
  pageY: number;
  /** Finger position at grant: slot origin + the touch location inside the sprite. */
  originX: number;
  originY: number;
  /** Finger (and sprite) translation since grant. */
  dx: number;
  dy: number;
  /** Finger travel inside the work area. */
  distance: number;
  /** A tool goal fired: later moves and the release are ignored for this touch. */
  settled: boolean;
}

export function startDragTouch(slot: DragPoint, location: DragPoint, page: DragPoint): DragTouch {
  return { pageX: page.x, pageY: page.y, originX: slot.x + location.x, originY: slot.y + location.y,
    dx: 0, dy: 0, distance: 0, settled: false };
}

/** Judge with the finger, not the sprite center: a long tool is often held far from its middle. */
export function getFingerPoint(touch: DragTouch): DragPoint {
  return { x: touch.originX + touch.dx, y: touch.originY + touch.dy };
}

/**
 * Follows the finger to `page`. With a `goal`, `reached` is true exactly once per touch — on the
 * move whose work-area distance first meets it — and the touch then settles.
 */
export function moveDragTouch(
  touch: DragTouch, page: DragPoint, area?: BakingRect, goal?: number,
): { touch: DragTouch; reached: boolean } {
  if (touch.settled) return { touch, reached: false };
  const moved = { ...touch, dx: page.x - touch.pageX, dy: page.y - touch.pageY };
  const distance = touch.distance
    + measureWorkDistance(getFingerPoint(touch), getFingerPoint(moved), area);
  const reached = goal !== undefined && distance >= goal;
  return { touch: { ...moved, distance, settled: reached }, reached };
}
