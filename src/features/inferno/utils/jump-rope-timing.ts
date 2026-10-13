import { JUMP_ROPE, JUMPER_PHASE } from '@/src/features/inferno/constants/jump-rope';

/** jumpIndex 번째 반죽이 줄 한가운데서 정점을 찍는 시각(줄이 바닥에 닿는 순간). */
export function getJumpPeakSec(jumpIndex: number): number {
  'worklet';
  return (jumpIndex * JUMP_ROPE.gap + JUMP_ROPE.firstPeakCycle) * JUMP_ROPE.periodSec;
}

/**
 * 슬롯이 지금 맡을 반죽 순번. 슬롯 s 는 s, s+slotCount, s+2·slotCount… 번째를 차례로 맡는다.
 * 앞 반죽이 완전히 사라진 뒤(u >= gone)에야 다음 순번으로 넘어가고, 다음 반죽은 그보다
 * 한 바퀴 넘게 지나서 나타나므로 이미지 교체가 화면에 보이지 않는다.
 */
export function getSlotJumpIndex(elapsedSec: number, slot: number): number {
  'worklet';
  const { gap, slotCount, firstPeakCycle, periodSec } = JUMP_ROPE;
  const recycleCycle = slot * gap + firstPeakCycle + JUMPER_PHASE.gone;
  const cycles = (elapsedSec / periodSec - recycleCycle) / (slotCount * gap);
  return slot + slotCount * Math.max(0, Math.floor(cycles) + 1);
}

/** 퇴장이 정해진 뒤에 나타나는 반죽은 보여주지 않는다. */
export function isJumpAfterExit(jumpIndex: number, exitAtSec: number): boolean {
  'worklet';
  return getJumpPeakSec(jumpIndex) + JUMPER_PHASE.appear * JUMP_ROPE.periodSec >= exitAtSec;
}

/** 현재 시각과 같아도 한 바퀴 더 기다리는, 엄밀히 다음 머리 위 시각. */
export function getNextOverheadTime(elapsedSec: number): number {
  'worklet';
  const period = JUMP_ROPE.periodSec;
  const next = (Math.floor(elapsedSec / period - 0.5) + 1.5) * period;
  return next > elapsedSec ? next : next + period;
}

export function getExitOpacity(elapsedSec: number, exitAtSec: number): number {
  'worklet';
  if (exitAtSec < 0) return 1;
  return Math.max(0, Math.min(1, 1 - (elapsedSec - exitAtSec) / JUMP_ROPE.fadeSec));
}

/** 0 이상 1 미만의 난수를 받아 반죽 종류 하나를 고른다(난수는 호출부가 넣는다). */
export function pickJumpBreadIndex(random: number, count: number): number {
  return Math.min(count - 1, Math.floor(random * count));
}

/**
 * 0..count-1 을 섞은 순서(Fisher–Yates). 난수 함수는 호출부가 넣는다.
 * avoidFirst 를 주면 그 번호가 맨 앞에 오지 않게 한다(목록을 다시 섞을 때 직전 문구가 바로 반복되지 않도록).
 */
export function shuffleMessageOrder(
  count: number,
  random: () => number,
  avoidFirst?: number,
): number[] {
  const order = Array.from({ length: count }, (_, index) => index);
  for (let index = count - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  if (count > 1 && order[0] === avoidFirst) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
}
