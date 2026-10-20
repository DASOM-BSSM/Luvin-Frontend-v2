/**
 * ep5 리포트 대기 문구와, 리포트가 온 뒤 RESULT 화면에서 도는 "반죽 → 빵" 등장 연출의 타이밍(초)·움직임 크기.
 * 연기 배치는 typography.ts 의 `bakeRevealLayout`, 반죽·빵 칸 크기는 RESULT 와 같은 `dough-figures.ts`.
 *
 * 흐름(사용자 지시, 2026-10-20):
 * 리포트 생성 중에는 대기 문구만 띄운다 → 리포트가 오면 RESULT 자리에서 두 반죽이 바깥에서 통통 뛰어
 * 서로 다가감 → 맞닿을 즈음 부드러운 연기가 둘을 덮음 → 연기가 걷히며 구운 빵이 스쿼시 앤 스트레치로
 * 튀어나옴 → 제목·하트·이름이 나타나며 그대로 RESULT 가 된다. 마지막 장면이 RESULT 와 같은 자리·크기라
 * 넘어갈 때 튀지 않는다.
 *
 * 연출 길이(약 8.5초)는 리포트가 온 뒤에 재생돼서 짧게 잡았다(내 판단). px 값은 실제 화면 px 이다.
 */
export const BAKE = {
  /** 반죽이 제자리에서 바깥으로 떨어진 채 시작하는 거리. 통통 뛸 때마다 이만큼을 나눠 다가온다. */
  approachStartPx: 90,
  hopCount: 4,
  hopStartSec: 0.3,
  hopIntervalSec: 1.15,
  hopDurationSec: 0.55,
  /** 상대 반죽은 반 박자 늦게 뛰어서 둘이 번갈아 다가온다. */
  partnerHopDelaySec: 0.55,
  hopHeightPx: 14,
  /** 뛰는 동안 세로로 늘어나는 정도. */
  hopStretch: 0.09,

  /** 뛰지 않을 때 숨 쉬듯 들썩인다(가로로 살짝 퍼지고 세로로 살짝 눌림). */
  breathPeriodSec: 1.6,
  breathStretchX: 0.04,
  breathSquashY: 0.05,

  /** 다 다가오면 서로 쪽으로 살짝 기울며 움츠린다(변신 직전의 예비 동작). */
  leanStartSec: 4.9,
  leanEndSec: 5.4,
  leanDeg: 5,

  /** 뒤의 은은한 빛. 다가오는 동안 차오르다가 연기와 함께 꺼진다. */
  glowStartSec: 1,

  smokeStartSec: 5.3,
  /** 연기가 둘을 다 덮은 순간. */
  smokeFullSec: 6.4,
  /** 연기 뒤에서 반죽 → 구운 빵으로 바뀌는 순간. */
  swapSec: 6.75,
  smokeClearStartSec: 7.0,
  smokeGoneSec: 8.2,
  /** 걷힐 때 연기가 떠오르는 높이. */
  smokeRisePx: 30,
  /** 연기 덩이가 제자리에서 몽글몽글 부풀었다 줄어드는 주기와 세기. */
  billowPeriodSec: 1.8,
  billowScale: 0.06,
  billowPx: 3,

  /** 빵이 납작하게 눌린 채 연기 뒤에 있다가 → 위로 늘어나며 튀고 → 제 모양으로 돌아온다. */
  popStartSec: 7.0,
  popStretchSec: 7.35,
  popSettleSec: 7.75,
  popSquashX: 1.16,
  popSquashY: 0.82,
  popStretchX: 0.92,
  popStretchY: 1.12,

  /** RESULT 의 제목·하트·이름이 나타나는 구간. 하트는 빵이 된 뒤에만 보인다(사용자 지시). */
  revealStartSec: 7.9,
  revealEndSec: 8.3,

  /** 연출이 끝나는 시각. 이때부터는 그냥 RESULT 화면이다. */
  endSec: 8.5,

  /** 잠깐의 프레임 지연으로 연출 한 구간을 통째로 건너뛰지 않게 한다(줄넘기 시계와 같은 값). */
  maxFrameSec: 1 / 15,
} as const;

/** 리포트를 만드는 동안 쪽지 가운데 뜨는 문구(사용자 지시). */
export const BAKE_WAIT_MESSAGE = '당신의 선택을 읽고 오븐에 들어갈 어울리는 반죽을 찾는 중이에요';

/** 대기가 `BAKE_WAIT_SLOW_AFTER_MS` 를 넘기면 위 문구 대신 띄운다(사용자 지시). */
export const BAKE_WAIT_SLOW_MESSAGE = '생각보다 오래 걸리고 있어요. 잘 익는 중이니 조금만 기다려 주세요';

export const BAKE_WAIT_SLOW_AFTER_MS = 20_000;
