/**
 * 대화(발화) 출력 속도 배율 계산. 순수 함수만 둔다 — 훅·저장소 접근 없음(AGENTS.md §6).
 *
 * 배율 1 이 기본 속도이고, 클수록 빨리 쳐진다. 슬라이더는 로그 눈금(log2)으로 맞춘다 —
 * 1/4 · 1/2 · 1 · 2배가 슬라이더 위에서 같은 간격으로 놓이고, 2배를 지날 때와 1/2배를
 * 지날 때의 체감 변화가 비슷해진다(선형이면 1/4~1/2 구간이 몇 픽셀로 쪼그라든다).
 */

export const DEFAULT_SPEED = 1;
export const MIN_SPEED = 0.25;
export const MAX_SPEED = 2;

/** 슬라이더에 스냅 눈금으로 박아 둘 속도와 그 라벨. 작은 속도부터. */
export const SPEED_MARKS = [
  { speed: 0.25, label: '1/4배' },
  { speed: 0.5, label: '1/2배' },
  { speed: DEFAULT_SPEED, label: '기본' },
  { speed: MAX_SPEED, label: '2배' },
] as const;

const LOG_MIN = Math.log2(MIN_SPEED);
const LOG_SPAN = Math.log2(MAX_SPEED) - LOG_MIN;

export function clampSpeed(speed: number): number {
  if (!Number.isFinite(speed)) {
    return DEFAULT_SPEED;
  }

  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed));
}

/** 슬라이더 위치(0~1) → 속도 배율. 소수 둘째 자리까지만 쓴다. */
export function positionToSpeed(position: number): number {
  const clamped = Math.min(1, Math.max(0, position));

  return clampSpeed(Math.round(2 ** (LOG_MIN + clamped * LOG_SPAN) * 100) / 100);
}

/** 속도 배율 → 슬라이더 위치(0~1). */
export function speedToPosition(speed: number): number {
  return (Math.log2(clampSpeed(speed)) - LOG_MIN) / LOG_SPAN;
}

/** 한 글자가 나오기까지 걸리는 시간(ms). 기본 속도의 글자당 시간을 배율로 나눈다. */
export function speedToCharMs(speed: number, baseMs: number): number {
  return baseMs / clampSpeed(speed);
}

/** 눈금에 걸린 속도면 그 라벨("기본" · "1/2배"…), 아니면 "0.73배" 처럼 숫자로. */
export function formatSpeed(speed: number): string {
  const mark = SPEED_MARKS.find((item) => Math.abs(item.speed - speed) < 0.005);

  return mark ? mark.label : `${Number(clampSpeed(speed).toFixed(2))}배`;
}
