/**
 * [DRAFT] 회차 열기 규칙(LUV-116). 순수 함수(§4).
 *
 * - 소금빵(무료 토큰): 미니게임으로만 얻는다. 열 때 비용만큼 쓰고, 앞 회차를 끝낸 뒤 하루가 지나야 연다.
 * - 식빵(유료 토큰): 결제로 얻는다. 하루를 기다리지 않고 바로 열 수 있다.
 *
 * 하루 기준 시각(`nextUnlockAt`)과 비용은 서버 값이다. 여기서 하루를 계산하지 않고 남은 시간만 구한다.
 */

export type UnlockPayment = 'SALT' | 'BREAD';

export interface UnlockOptions {
  /** 하루 대기가 남았는지. 소금빵으로는 이때 열 수 없다. */
  isWaiting: boolean;
  remainingMs: number;
  canPaySalt: boolean;
  canPayBread: boolean;
}

export function getRemainingMs(nextUnlockAt: string | null, now: number): number {
  if (nextUnlockAt === null) return 0;
  const at = Date.parse(nextUnlockAt);
  return Number.isNaN(at) ? 0 : Math.max(0, at - now);
}

export function getUnlockOptions(params: {
  cost: number | null;
  salt: number | undefined;
  bread: number | undefined;
  nextUnlockAt: string | null;
  now: number;
}): UnlockOptions {
  const { cost, salt, bread, nextUnlockAt, now } = params;
  const remainingMs = getRemainingMs(nextUnlockAt, now);
  const isWaiting = remainingMs > 0;
  return {
    isWaiting,
    remainingMs,
    // 비용이나 잔액을 아직 모르면 막지 않고 서버가 정한다(409 가 오면 그때 안내한다).
    canPaySalt: !isWaiting && (cost === null || salt === undefined || salt >= cost),
    canPayBread: cost === null || bread === undefined || bread >= cost,
  };
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** 남은 시간 문구. 1분 미만은 올림해서 "1분"으로 보인다. 예: "23시간 10분", "35분". */
export function formatRemaining(ms: number): string {
  const total = Math.max(MINUTE_MS, Math.ceil(ms / MINUTE_MS) * MINUTE_MS);
  const days = Math.floor(total / DAY_MS);
  const hours = Math.floor((total % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((total % HOUR_MS) / MINUTE_MS);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}일`);
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}분`);
  return parts.join(' ');
}
