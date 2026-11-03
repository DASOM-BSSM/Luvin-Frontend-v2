import { BAKE } from '@/src/features/inferno/constants/bake';

/**
 * ep5 굽기 연출의 순간순간 모습. 전부 연출 시각(초)만 받아 값을 돌려주는 순수 함수다 — UI 스레드
 * 시계(use-bake-clock)가 매 프레임 부른다.
 *
 * 끝 시각(`BAKE.endSec`)에서는 모든 값이 제자리(이동 0, 크기 1, 연기·빛 0, 제목·하트 보임)로 돌아온다.
 * 연출 없이 RESULT 를 보여줄 때도 시계를 끝 시각에 두고 같은 함수를 쓰므로, 연출이 끝난 화면과
 * 처음부터 RESULT 인 화면이 똑같다.
 */

/** start~end 사이에서 0→1. 범위 밖은 0 또는 1 로 자른다. */
function ramp(timeSec: number, startSec: number, endSec: number): number {
  'worklet';
  if (timeSec <= startSec) return 0;
  if (timeSec >= endSec) return 1;
  return (timeSec - startSec) / (endSec - startSec);
}

function lerp(from: number, to: number, amount: number): number {
  'worklet';
  return from + (to - from) * amount;
}

function easeOut(amount: number): number {
  'worklet';
  return 1 - (1 - amount) * (1 - amount);
}

function easeInOut(amount: number): number {
  'worklet';
  return amount < 0.5 ? 2 * amount * amount : 1 - (-2 * amount + 2) ** 2 / 2;
}

/** 0 에서 시작해 0..1 을 부드럽게 오가는 물결. */
function wave(timeSec: number, periodSec: number): number {
  'worklet';
  return (1 - Math.cos((2 * Math.PI * timeSec) / periodSec)) / 2;
}

/**
 * 시계를 한 프레임 넘긴다. 끝 시각을 넘지 않는다.
 *
 * 리포트가 아직 안 왔으면(`isReleased` false) 기다리는 구간(holdStartSec~holdEndSec) 끝에 닿을 때 구간 처음으로
 * 되돌린다 — 연기가 덮은 채 몽글거리는 장면이 리포트가 올 때까지 이어진다. 리포트가 오면 그 구간을 지나
 * 빵이 되는 장면으로 넘어간다.
 */
export function advanceBakeTime(timeSec: number, deltaSec: number, isReleased: boolean): number {
  'worklet';
  const next = timeSec + deltaSec;
  if (!isReleased && timeSec < BAKE.holdEndSec && next >= BAKE.holdEndSec) {
    return next - (BAKE.holdEndSec - BAKE.holdStartSec);
  }
  return Math.min(next, BAKE.endSec);
}

/** 연기 뒤에서 반죽이 빵이 되고 상대가 들어서는 순간을 지났는지. */
export function hasBakeSwapped(timeSec: number): boolean {
  'worklet';
  return timeSec >= BAKE.swapSec;
}

export function isBakeComplete(timeSec: number): boolean {
  'worklet';
  return timeSec >= BAKE.endSec;
}

export interface BakeFigurePose {
  /** 제자리에서 떨어진 거리(px). */
  x: number;
  y: number;
  rotateDeg: number;
  scaleX: number;
  scaleY: number;
  /** 반죽 그림과 구운 빵 그림의 투명도. 연기에 가려진 `swapSec` 에 바뀐다. */
  doughOpacity: number;
  breadOpacity: number;
}

/** 구운 빵이 연기 뒤에서 튀어나오는 스쿼시 앤 스트레치. */
function getPopScale(timeSec: number): { scaleX: number; scaleY: number } {
  'worklet';
  if (timeSec < BAKE.popStartSec) {
    return { scaleX: BAKE.popSquashX, scaleY: BAKE.popSquashY };
  }
  if (timeSec < BAKE.popStretchSec) {
    const amount = easeOut(ramp(timeSec, BAKE.popStartSec, BAKE.popStretchSec));
    return {
      scaleX: lerp(BAKE.popSquashX, BAKE.popStretchX, amount),
      scaleY: lerp(BAKE.popSquashY, BAKE.popStretchY, amount),
    };
  }
  const amount = easeOut(ramp(timeSec, BAKE.popStretchSec, BAKE.popSettleSec));
  return { scaleX: lerp(BAKE.popStretchX, 1, amount), scaleY: lerp(BAKE.popStretchY, 1, amount) };
}

/**
 * 반죽(→빵) 한 마리. `side` 는 왼쪽 -1, 오른쪽 1. 바깥에서 통통 뛰어 제자리로 다가오고, 다 오면 반대쪽으로
 * 기울며 움츠렸다가, 연기 뒤에서 빵으로 바뀌어 튀어나온다. 발끝을 기준으로 커지고 줄어든다.
 *
 * 기다리는 동안 나오는 건 내 반죽(왼쪽) 하나다. 상대는 연기 뒤에서 빵이 되는 순간(swapSec)부터 들어서므로
 * 반죽 구간을 쓰지 않는다. 연기가 다 덮은 뒤(holdStartSec~)는 반죽이 연기 뒤에서 멈춰 있다 — 기다리는
 * 구간이 되풀이돼도 반죽 모습이 튀지 않는다.
 */
export function getFigurePose(timeSec: number, side: number): BakeFigurePose {
  'worklet';
  if (timeSec >= BAKE.swapSec) {
    const pop = getPopScale(timeSec);
    return { x: 0, y: 0, rotateDeg: 0, ...pop, doughOpacity: 0, breadOpacity: 1 };
  }

  const doughSec = Math.min(timeSec, BAKE.holdStartSec);

  let hops = 0;
  let y = 0;
  let scaleX = 1;
  let scaleY = 1;
  let isHopping = false;
  for (let hop = 0; hop < BAKE.hopCount; hop += 1) {
    const startSec = BAKE.hopStartSec + hop * BAKE.hopIntervalSec;
    const progress = ramp(doughSec, startSec, startSec + BAKE.hopDurationSec);
    if (progress >= 1) {
      hops += 1;
    } else if (progress > 0) {
      const arc = Math.sin(Math.PI * progress);
      hops += easeInOut(progress);
      y = -BAKE.hopHeightPx * arc;
      scaleX = 1 - 0.05 * arc;
      scaleY = 1 + BAKE.hopStretch * arc;
      isHopping = true;
    }
  }

  if (!isHopping) {
    const breath = wave(doughSec, BAKE.breathPeriodSec);
    scaleX *= 1 + BAKE.breathStretchX * breath;
    scaleY *= 1 - BAKE.breathSquashY * breath;
  }

  const lean = easeInOut(ramp(doughSec, BAKE.leanStartSec, BAKE.leanEndSec));
  scaleX *= 1 + 0.04 * lean;
  scaleY *= 1 - 0.06 * lean;

  return {
    x: side * BAKE.approachStartPx * (1 - hops / BAKE.hopCount),
    y,
    // 왼쪽(-1)은 오른쪽으로, 오른쪽(1)은 왼쪽으로 기운다. 내 반죽(왼쪽)은 상대가 들어설 쪽으로 기운다.
    rotateDeg: -side * BAKE.leanDeg * lean,
    scaleX,
    scaleY,
    doughOpacity: 1,
    breadOpacity: 0,
  };
}

export interface BakeFade {
  opacity: number;
  scale: number;
}

/** 두 반죽 뒤의 은은한 빛. 다가오는 동안 차오르고 연기가 걷힐 때 꺼진다. */
export function getGlow(timeSec: number): BakeFade {
  'worklet';
  const rise = ramp(timeSec, BAKE.glowStartSec, BAKE.smokeFullSec);
  return {
    opacity: 0.8 * easeInOut(rise) * (1 - ramp(timeSec, BAKE.smokeClearStartSec, BAKE.smokeGoneSec)),
    scale: lerp(0.7, 1.05, rise),
  };
}

export interface BakePuffPose {
  opacity: number;
  /** 연기 가운데(두 마리 줄의 가운데)에서 떨어진 거리(px). */
  x: number;
  y: number;
  scale: number;
}

/**
 * 연기 한 덩이(가장자리가 흐린 원). 가운데 가까이에서 작게 피어나 제자리(`puffX`, `puffY`)로 퍼져 둘을
 * 덮고, 몽글몽글 부풀었다 줄었다 하다가, 걷힐 때 더 커지며 위로 떠올라 사라진다.
 */
export function getPuffPose(timeSec: number, puffX: number, puffY: number, index: number): BakePuffPose {
  'worklet';
  const gather = easeOut(ramp(timeSec, BAKE.smokeStartSec, BAKE.smokeFullSec));
  const clear = easeOut(ramp(timeSec, BAKE.smokeClearStartSec, BAKE.smokeGoneSec));
  // 덩이마다 위상을 어긋나게 해서 한꺼번에 숨 쉬지 않게 한다.
  const billow = Math.sin(2 * Math.PI * (timeSec / BAKE.billowPeriodSec + index * 0.17));
  const spread = lerp(0.35, 1, gather) * (1 + 0.5 * clear);

  return {
    opacity: gather * (1 - clear),
    x: puffX * spread,
    y: puffY * spread - BAKE.smokeRisePx * clear + BAKE.billowPx * billow,
    scale: lerp(0.3, 1, gather) * (1 + 0.35 * clear) * (1 + BAKE.billowScale * billow),
  };
}

/** 1페이지의 제목·하트·이름 투명도. 빵이 자리를 잡은 뒤에 나타난다. */
export function getRevealOpacity(timeSec: number): number {
  'worklet';
  return ramp(timeSec, BAKE.revealStartSec, BAKE.revealEndSec);
}

/** 대기 문구 투명도. 기다리는 동안 보이다가, 리포트가 와서 기다리는 구간을 벗어나면 빵이 되기 전까지 사라진다. */
export function getWaitMessageOpacity(timeSec: number): number {
  'worklet';
  return 1 - ramp(timeSec, BAKE.holdEndSec, BAKE.swapSec);
}
