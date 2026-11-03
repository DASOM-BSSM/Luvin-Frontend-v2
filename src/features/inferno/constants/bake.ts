/** 연기 덩이가 몽글거리는 주기. 리포트를 기다리는 구간이 이 길이만큼 되풀이된다(아래 holdStartSec 주석). */
const BILLOW_PERIOD_SEC = 1.8;
/** 연기가 내 반죽을 다 덮은 순간. 여기서부터 리포트를 기다린다. */
const SMOKE_FULL_SEC = 6.4;

/**
 * ep5 리포트 대기 문구와 "반죽 → 빵" 굽기 연출의 타이밍(초)·움직임 크기.
 * 연기 배치는 typography.ts 의 `bakeRevealLayout`, 반죽·빵 칸 크기는 RESULT 와 같은 `dough-figures.ts`.
 *
 * 처음 흐름(사용자 지시, 2026-10-20 오전): 리포트 생성 중에는 대기 문구만 → 리포트가 오면 두 반죽이 다가와
 * 연기 속에서 구운 빵이 된다.
 *
 * 지금 흐름(사용자 지시, 2026-10-20 오후 — "리포트 생성되기 전에는 빵 구워지는 애니메이션"):
 * 리포트를 만드는 동안 굽기 연출을 튼다. 최종 상대는 리포트가 와야 알 수 있어서(서버가 리포트에 담아 준다)
 * 기다리는 동안은 내 반죽만 나온다(사용자 결정) — 내 반죽이 바깥에서 통통 뛰어 들어옴 → 기울며 움츠림 →
 * 연기가 덮음 → 리포트가 올 때까지 연기가 덮은 채 몽글거림(holdStartSec~holdEndSec 되풀이) → 리포트가
 * 오면 연기 뒤에서 내 빵 옆에 상대가 들어서고 둘 다 구운 빵이 됨 → 연기가 걷히며 스쿼시 앤 스트레치로
 * 튀어나옴 → 제목·하트·이름이 나타나며 그대로 리포트 1페이지가 된다. 마지막 장면이 1페이지와 같은
 * 자리·크기라 넘어갈 때 튀지 않는다.
 *
 * 리포트가 일찍 와도 내 반죽이 다 들어와 연기에 덮일 때까지는 연출을 마저 튼다(최소 약 10초). px 값은
 * 실제 화면 px 이다.
 */
export const BAKE = {
  /** 반죽이 제자리에서 바깥으로 떨어진 채 시작하는 거리. 통통 뛸 때마다 이만큼을 나눠 다가온다. */
  approachStartPx: 90,
  hopCount: 4,
  hopStartSec: 0.3,
  hopIntervalSec: 1.15,
  hopDurationSec: 0.55,
  hopHeightPx: 14,
  /** 뛰는 동안 세로로 늘어나는 정도. */
  hopStretch: 0.09,

  /** 뛰지 않을 때 숨 쉬듯 들썩인다(가로로 살짝 퍼지고 세로로 살짝 눌림). */
  breathPeriodSec: 1.6,
  breathStretchX: 0.04,
  breathSquashY: 0.05,

  /** 다 들어오면 상대가 나타날 쪽으로 살짝 기울며 움츠린다(변신 직전의 예비 동작). */
  leanStartSec: 4.9,
  leanEndSec: 5.4,
  leanDeg: 5,

  /** 뒤의 은은한 빛. 다가오는 동안 차오르다가 연기와 함께 꺼진다. */
  glowStartSec: 1,

  smokeStartSec: 5.3,
  /** 연기가 다 덮은 순간. */
  smokeFullSec: SMOKE_FULL_SEC,

  /**
   * 리포트를 기다리는 구간. 리포트가 오기 전에는 시계가 holdEndSec 에 닿으면 holdStartSec 로 되돌아가 이
   * 구간을 되풀이한다. 이 동안 연기는 다 덮은 채 몽글거리고, 반죽은 연기 뒤에서 멈춰 있다. 구간 길이를 연기
   * 주기(billowPeriodSec)와 같게 둬서 되돌아가는 순간 이음매가 보이지 않는다.
   */
  holdStartSec: SMOKE_FULL_SEC,
  holdEndSec: SMOKE_FULL_SEC + BILLOW_PERIOD_SEC,

  /** 연기 뒤에서 반죽 → 구운 빵으로 바뀌고 상대가 들어서는 순간. 리포트가 온 뒤에만 지나간다. */
  swapSec: 8.55,
  smokeClearStartSec: 8.8,
  smokeGoneSec: 10,
  /** 걷힐 때 연기가 떠오르는 높이. */
  smokeRisePx: 30,
  /** 연기 덩이가 제자리에서 몽글몽글 부풀었다 줄어드는 주기와 세기. */
  billowPeriodSec: BILLOW_PERIOD_SEC,
  billowScale: 0.06,
  billowPx: 3,

  /** 빵이 납작하게 눌린 채 연기 뒤에 있다가 → 위로 늘어나며 튀고 → 제 모양으로 돌아온다. */
  popStartSec: 8.8,
  popStretchSec: 9.15,
  popSettleSec: 9.55,
  popSquashX: 1.16,
  popSquashY: 0.82,
  popStretchX: 0.92,
  popStretchY: 1.12,

  /** 1페이지의 제목·하트·이름이 나타나는 구간. 하트는 빵이 된 뒤에만 보인다(사용자 지시). */
  revealStartSec: 9.7,
  revealEndSec: 10.1,

  /** 연출이 끝나는 시각. 이때부터는 그냥 리포트 1페이지다. */
  endSec: 10.3,

  /** 잠깐의 프레임 지연으로 연출 한 구간을 통째로 건너뛰지 않게 한다(줄넘기 시계와 같은 값). */
  maxFrameSec: 1 / 15,
} as const;

/** 리포트를 만드는 동안 굽기 연출 아래(1페이지 이름 자리)에 뜨는 문구(사용자 지시). */
export const BAKE_WAIT_MESSAGE = '당신의 선택을 읽고 오븐에 들어갈 어울리는 반죽을 찾는 중이에요';

/** 대기가 `BAKE_WAIT_SLOW_AFTER_MS` 를 넘기면 위 문구 대신 띄운다(사용자 지시). */
export const BAKE_WAIT_SLOW_MESSAGE = '생각보다 오래 걸리고 있어요. 잘 익는 중이니 조금만 기다려 주세요';

export const BAKE_WAIT_SLOW_AFTER_MS = 20_000;
