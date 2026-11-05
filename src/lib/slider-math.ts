/**
 * 슬라이더 계산. 순수 함수만 둔다(AGENTS.md §6) — `src/components/ui/slider.tsx` 가 쓴다.
 * 위치는 모두 0~1 로 맞춘 값이다.
 */

export function clampPosition(position: number): number {
  return Math.min(1, Math.max(0, position));
}

/**
 * 터치한 x 좌표(트랙 왼쪽 끝 기준) → 위치. 손잡이 중심이 닿을 수 있는 범위는
 * 트랙 폭에서 손잡이 폭을 뺀 만큼이라, 양끝에서 손잡이 반지름씩 안쪽으로 잡는다.
 */
export function positionFromX(x: number, trackWidth: number, thumbSize: number): number {
  const travel = trackWidth - thumbSize;

  if (travel <= 0) {
    return 0;
  }

  return clampPosition((x - thumbSize / 2) / travel);
}

/** `threshold` 안에 눈금이 있으면 그 눈금으로 끌어당긴다. 없으면 그대로. */
export function snapPosition(position: number, points: readonly number[], threshold: number): number {
  let nearest = position;
  let nearestGap = threshold;

  for (const point of points) {
    const gap = Math.abs(point - position);

    if (gap <= nearestGap) {
      nearest = point;
      nearestGap = gap;
    }
  }

  return nearest;
}

/** 지금 위치에서 `direction` 쪽으로 가장 가까운 눈금. 끝이면 그 자리 그대로. */
export function stepToPoint(position: number, points: readonly number[], direction: 1 | -1): number {
  const sorted = [...points].sort((a, b) => a - b);
  const epsilon = 0.0001;
  const candidates =
    direction === 1
      ? sorted.filter((point) => point > position + epsilon)
      : sorted.filter((point) => point < position - epsilon).reverse();

  return candidates[0] ?? position;
}

/**
 * 같은 폭(`itemWidth`)의 항목을 가로로 이어 붙이되 각 항목의 중심이 `centers` 에 오도록
 * 항목마다 앞에 붙일 왼쪽 여백을 구한다. 겹치게 놓이면 음수가 나온다.
 */
export function leadingOffsets(centers: readonly number[], itemWidth: number): number[] {
  let previousRight = 0;

  return centers.map((center) => {
    const left = center - itemWidth / 2;
    const offset = left - previousRight;

    previousRight = left + itemWidth;

    return offset;
  });
}
