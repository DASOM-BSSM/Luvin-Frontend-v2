import type { MissionRange } from '@/src/features/luvin-hell/types';

/** [min, max] 양끝 포함 정수 균등분포. 런 시작마다 1회만 호출해서 그 값을 고정해 쓴다. */
export function rollMissionTarget(range: MissionRange, rng: () => number = Math.random): number {
  const [min, max] = range;
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function hasMetMissionTarget(score: number, missionTarget: number): boolean {
  return score >= missionTarget;
}

/**
 * 난이도(목표치가 range 안에서 차지하는 비율)에 비례해 보상 토큰을 계산한다.
 * range 최저치 달성 시 최소 보상(BASE_REWARD), 최고치 달성 시 최대 보상(MAX_REWARD).
 */
const BASE_REWARD = 2;
const MAX_REWARD = 5;

export function rewardForTarget(missionTarget: number, range: MissionRange): number {
  const [min, max] = range;
  if (max === min) return BASE_REWARD;
  const difficultyRatio = (missionTarget - min) / (max - min);
  return Math.round(BASE_REWARD + difficultyRatio * (MAX_REWARD - BASE_REWARD));
}
