/**
 * 타이포그래피 토큰.
 *
 * 출처: Figma "Luvin-Design" 의 로컬 텍스트 스타일 (`Heading/H1`~`H5`, `Body/XL`~`XXS`).
 * tailwind.config.js 가 이 파일을 require 해서 쓴다. 값은 여기서만 고칠 것.
 */

import { defaultColor, pink } from './colors';

/**
 * Heading = "Yde street B", Body = "Yde street L" 로 서로 다른 패밀리를 쓴다.
 * RN 은 정적 폰트 파일 간 굵기 합성을 못 하므로 fontWeight 대신 패밀리를 나눈다.
 * 값 = ttf 의 PostScript 이름 = src/app/_layout.tsx 의 useFonts 키.
 *
 * okMallangB 폰트 파일은 "OkMallangB-Regular.ttf" (Calligraphr 제작, 원본 파일명
 * "Ok Mallang B.ttf"에서 공백 제거하여 리네임 — Android에서 Metro가 공백 포함 파일명의 폰트
 * asset을 정상 로드하지 못해 커스텀 폰트가 조용히 시스템 기본 폰트로 폴백되는 문제가 있었음).
 *
 * 등록 키(useFonts)와 이 값은 ttf의 실제 PostScript 이름("OkMallangB-Regular")과 달리
 * "OkMallangBRegular"를 쓴다 — expo-font의 Android 커스텀 폰트 레지스트리는 useFonts에 넘긴
 * 키 문자열 그대로 등록/조회하므로 ttf 내부 이름과 달라도 무방하다.
 *
 * 실기기(Android) 확인된 별도 버그: 이 값을 `font-ok-mallang-b` Tailwind 클래스(NativeWind
 * className 경로)로 적용하면 하이픈 유무와 무관하게 항상 시스템 기본 폰트로 조용히 폴백된다
 * (raw `style={{ fontFamily: fontFamily.okMallangB }}`는 정상 렌더 — RN/폰트 등록 자체는
 * 문제없고, NativeWind v4의 CSS→RN 스타일 변환 파이프라인에서만 이 패밀리가 깨짐. 원인을
 * 하이픈으로 의심해 제거해봤지만 재현됨 — NativeWind 자체의 한계로 결론). 그래서 이 폰트는
 * className(`font-ok-mallang-b`)이 아니라 항상 `style` prop으로 직접 적용한다 — §16 인라인
 * 스타일 금지의 예외(측정된 이유 있음, Reanimated 예외와 동급). 테두리가 있는 텍스트는
 * `OkMallangBText`(아래 `display.*`/§8 참고)로, 테두리 없는 단순 텍스트는 아래
 * `okMallangBStyle`/`okMallangBTitleStyle`을 `style` prop으로 직접 적용한다.
 */
export const fontFamily = {
  ydeStreetB: 'YdestreetB',
  ydeStreetL: 'YdestreetL',
  okMallangB: 'OkMallangBRegular',
};

/**
 * className(`font-ok-mallang-b`)이 실기기에서 깨지는 문제의 우회로 남겨둔 style 객체 —
 * 테두리 없는 단순 Ok Mallang B 텍스트(예: `okMallangBTitleStyle`)에 쓴다. 테두리가 있는
 * 텍스트는 `OkMallangBText`(위 주석 참고)를 쓸 것.
 */
export const okMallangBStyle = { fontFamily: fontFamily.okMallangB };

/** Figma 텍스트 스타일 공통 line-height (160%) */
export const lineHeightRatio = 1.6;

/**
 * Ok Mallang B 로 쓰는 한 줄짜리 강조 제목. Figma 모달의 "NOTICE" (6602:3955).
 *
 * Figma 에 이름 붙은 텍스트 스타일이 아니라 그 자리에서만 쓰는 22px 값이라 Heading/Body
 * 척도에는 넣지 않았다. 같은 크기가 다른 화면에도 나오면 그때 정식 토큰으로 올릴 것.
 * Episode 03의 "MINI GAME"(5726:3280)도 동일한 22px/160%여서 이 토큰을 공유한다.
 */
export const okMallangBTitleStyle = {
  ...okMallangBStyle,
  fontSize: 22,
  lineHeight: 22 * lineHeightRatio,
};

/** Figma 5726:3271: 781×300 쪽지 안의 컵·테이블 배치. */
export const infernoMiniGameLayout = {
  width: {
    'inferno-cup': '100px',
    // 카드 뒤집기 HUD 좌우 칸. 오른쪽 하트 줄 폭만큼 왼쪽에도 빈 칸을 둬서
    // "MINI GAME" 제목이 가운데 오게 한다. 하트 5개(사용자 요청, 시안 6219:4039 는 4개):
    // 하트 20 × 5 + 간격 8 × 4 = 132. 목숨 수(CARDFLIP_LIVES)를 바꾸면 이 값도 같이 바꿀 것.
    'inferno-hud-side': '132px',
  },
  height: {
    'inferno-cup': '114px',
    // 테이블은 쪽지 상단에서 256px. 제목 60.8 + 간격 44 + 상단 여백 48을 뺀다.
    'inferno-cup-visible': '103.2px',
    'inferno-game-gap': '44px',
    'inferno-table': '44px',
    // 야바위 책상. 컵 바닥을 덮으려고 inferno-cup-hidden 만큼 위로 올라오므로 그만큼 더 높다(44 + 10.8).
    'inferno-shell-table': '54.8px',
  },
  spacing: {
    'inferno-cup-gap': '70px',
    // 컵(114) 중 책상 뒤로 가려지는 아래쪽. 114 - inferno-cup-visible(103.2). 책상을 이만큼
    // 올려 컵 바닥을 덮고, 프레첼은 이만큼 띄워 책상 선 위에 서게 한다.
    'inferno-cup-hidden': '10.8px',
  },
};

/** Figma 5726:2608 / 7966:6180 / 7966:6239, coordinates inside the frame border.
 * Sprite positions, like the other minigames, require positioned animated views.
 */
export const bakingLayout = {
  spacing: {
    'baking-top': '26px',
    'baking-header-gap': '8px',
    'baking-frame-gap': '16px',
    'baking-footer-gap': '40px',
    'baking-timer-top': '19px',
    'baking-timer-right': '16px',
  },
  width: { 'baking-content': '340px' },
  slots: {
    flour: { x: 12, y: 94, width: 67, height: 72 },
    eggs: { x: 87, y: 106.5, width: 85, height: 47 },
    butter: { x: 180, y: 104.5, width: 68, height: 51 },
    water: { x: 256, y: 94, width: 64, height: 72 },
    salt: { x: 93, y: 175.5, width: 37, height: 57 },
    sugar: { x: 146, y: 175.5, width: 39, height: 57 },
    yeast: { x: 201, y: 175, width: 39, height: 58 },
    whisk: { x: 208, y: 213, width: 100.788, height: 137.041 },
    emptyBowl: { x: 92.5, y: 334.5, width: 147, height: 124 },
    doughBowl: { x: 92, y: 334, width: 148, height: 125 },
    board: { x: 72, y: 226, width: 188, height: 135 },
    // Shaping on the large board (GPT assets, 2026-10-29). Not in Figma: placed to fit the frame.
    largeBoard: { x: 10, y: 250, width: 320, height: 189.2 },
    // Every shaping-* dough image shares one crop (1169x569), so stages swap without jumping.
    boardDough: { x: 55, y: 275, width: 230, height: 112 },
    shapeArrow: { x: 120, y: 171, width: 100, height: 38.3 },
    rollingPin: { x: 95, y: 455, width: 150, height: 39 },
    boardButter: { x: 40, y: 140, width: 68, height: 51 },
    boardSalt: { x: 262, y: 137, width: 37, height: 57 },
    oven: { x: 71, y: 129, width: 177, height: 147 },
    tray: { x: 74, y: 293, width: 188, height: 126 },
    saltBread: { x: 121, y: 317, width: 94.808, height: 78.351 },
    // Salted shaping dough on the tray, centred where `saltBread` sits.
    trayDough: { x: 103, y: 325, width: 130, height: 63.3 },
    // Oven gauge (GPT asset, 2005x341 after crop). Track = inner hole at px 132–1873 x 141–257.
    timerFrame: { x: 40, y: 74, width: 260, height: 44.2 },
    timerTrack: { x: 57.1, y: 92.3, width: 225.8, height: 15 },
    // Marker x follows progress; its tip (bottom) dips into the track.
    timerMarker: { x: 0, y: 66, width: 24.5, height: 30 },
  },
  targets: {
    bowl: { x: 92, y: 334, width: 148, height: 125 },
    board: { x: 72, y: 226, width: 188, height: 135 },
    oven: { x: 71, y: 129, width: 177, height: 147 },
    tray: { x: 74, y: 293, width: 188, height: 126 },
    largeBoard: { x: 10, y: 250, width: 320, height: 189.2 },
  },
} as const;

/**
 * AI 답장 대기 "빵 줄넘기" 장면의 기준 좌표. Figma `ep0` 줄넘기 시안(7219:3595)의 쪽지
 * (781x300) 안 좌표를 그대로 옮겼다. 실제 쪽지 크기에 맞춰 비율로 스케일한다.
 *
 * 시안은 한 순간(줄이 머리 위에 있을 때)만 그린 정지 화면이라, 줄이 바닥까지 내려오는 깊이와
 * 반죽이 오가는 동선(줄 서기 → 넘기 → 빠져나가기)은 시안의 위치를 기준으로 정했다.
 */
export const jumpRopeLayout = {
  width: 781,
  height: 300,
  /** 아바타·반죽 발끝이 닿는 선. 시안의 반죽 아래 끝(194 + 43). */
  groundY: 237,
  /** "대화가 생성되는 동안…" 문구 윗변. Figma 7219:3695. */
  messageTop: 62,
  holder: {
    /** 여자 아바타 옆모습. Figma `image 52` (7219:3702). */
    girl: { x: 189, y: 112, width: 55, height: 123 },
    /** 남자 아바타 옆모습. Figma `image 51` (7219:3704). */
    boy: { x: 535, y: 112, width: 57, height: 123 },
  },
  rope: {
    /** 줄 양 끝(손잡이와 이어지는 점). Figma `Group 13` (7219:3710)의 Vector 1 끝점. */
    startX: 228,
    endX: 553,
    endY: 204,
    /** 줄 가운데가 끝점보다 올라가는 높이(시안의 꼭대기 122)와 내려가는 깊이(바닥 직전). */
    upHeight: 82,
    downHeight: 29,
    /** 손이 줄을 돌리며 그리는 작은 원의 반지름. */
    handRadius: 3,
    strokeWidth: 2,
    /** 분홍 손잡이. 시안 19x5 둥근 사각형. */
    handleLength: 19,
    handleWidth: 5,
    /**
     * 줄 SVG 캔버스 범위. 줄과 손잡이가 움직이는 영역에 여유만 더했다.
     * Android 는 SVG 를 매 프레임 비트맵으로 다시 그려 올리므로 쪽지 전체 크기로 두면 무겁다.
     */
    canvas: { x: 195, y: 108, width: 391, height: 136 },
  },
  jumper: {
    /** 시안 반죽 50x43. */
    width: 50,
    height: 43,
    /** 줄 선 자리(가운데 x). 시안 왼쪽 두 반죽 7219:3735 / 7219:3733. */
    queueBackX: 99.5,
    queueFrontX: 153.5,
    /** 줄 밑으로 들어가는 곳 ~ 빠져나오는 곳. 가운데(390.5)가 시안 7219:3737 자리다. */
    jumpStartX: 300,
    jumpEndX: 481,
    /** 남자 아바타 뒤로 빠져나가며 사라지는 곳. */
    exitX: 690,
    hopHeight: 5,
    jumpHeight: 50,
  },
} as const;

/**
 * ep5 RESULT 등장 연출(반죽 → 연기 → 구운 빵)의 연기·빛 배치. 두 마리가 선 줄의 가운데를 원점으로 한
 * 실제 화면 px 다. 반죽·빵 칸 크기는 여기 두지 않는다 — RESULT 와 연출이 같은 칸(dough-figures.ts 의
 * chatSizeClass)을 써야 넘어갈 때 크기가 어긋나지 않는다(사용자 지시).
 *
 * Figma 시안이 없어 시뮬레이터에서 보며 정한 값이다(2026-10-20). 시안이 나오면 다시 잴 것.
 */
export const bakeRevealLayout = {
  /** 두 마리 뒤의 은은한 빛(타원). */
  glow: { width: 420, height: 200 },
  /**
   * 연기 한 덩이 = 가장자리가 흐린 원. x/y 는 줄 가운데에서 다 퍼졌을 때의 자리, size 는 지름,
   * tone 은 연기 색 순번(inferno-bake-smoke 의 SMOKE_TONES). 두 마리(줄 폭 약 250)를 넉넉히 덮도록 깔았다.
   */
  smokePuffs: [
    { x: -150, y: 18, size: 84, tone: 1 },
    { x: -125, y: -12, size: 104, tone: 0 },
    { x: -85, y: -32, size: 100, tone: 1 },
    { x: -85, y: 24, size: 104, tone: 2 },
    { x: -40, y: -8, size: 110, tone: 1 },
    { x: 0, y: -34, size: 100, tone: 2 },
    { x: 0, y: 22, size: 110, tone: 0 },
    { x: 40, y: -8, size: 110, tone: 2 },
    { x: 85, y: -32, size: 100, tone: 0 },
    { x: 85, y: 24, size: 104, tone: 1 },
    { x: 125, y: -12, size: 104, tone: 2 },
    { x: 150, y: 18, size: 84, tone: 0 },
    // 두 마리 몸통 위를 한 겹 더 덮는다. 바깥 줄만으로는 변신 순간 빵 윤곽이 비쳤다(시뮬레이터에서 확인).
    { x: -105, y: 0, size: 112, tone: 2 },
    { x: -60, y: 8, size: 104, tone: 0 },
    { x: 60, y: 8, size: 104, tone: 1 },
    { x: 105, y: 0, size: 112, tone: 0 },
  ],
} as const;

/** Figma: `Heading/H1` ~ `Heading/H5` */
export const heading = {
  h1: {
    fontFamily: fontFamily.ydeStreetB,
    fontSize: 24,
    lineHeight: 24 * lineHeightRatio,
  },
  h2: {
    fontFamily: fontFamily.ydeStreetB,
    fontSize: 20,
    lineHeight: 20 * lineHeightRatio,
  },
  h3: {
    fontFamily: fontFamily.ydeStreetB,
    fontSize: 18,
    lineHeight: 18 * lineHeightRatio,
  },
  h4: {
    fontFamily: fontFamily.ydeStreetB,
    fontSize: 16,
    lineHeight: 16 * lineHeightRatio,
  },
  h5: {
    fontFamily: fontFamily.ydeStreetB,
    fontSize: 14,
    lineHeight: 14 * lineHeightRatio,
  },
};

/** Figma: `Body/XL` ~ `Body/XXS` */
export const body = {
  xl: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 20,
    lineHeight: 20 * lineHeightRatio,
  },
  l: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 18,
    lineHeight: 18 * lineHeightRatio,
  },
  m: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 16,
    lineHeight: 16 * lineHeightRatio,
  },
  s: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 14,
    lineHeight: 14 * lineHeightRatio,
  },
  xs: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 12,
    lineHeight: 12 * lineHeightRatio,
  },
  xxs: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 10,
    lineHeight: 10 * lineHeightRatio,
  },
};

/** `Ok Mallang B` 표시용 텍스트의 line-height 비율. Figma: `leading-[1.1]` (Heading/Body 의 1.6 과 다름). */
const DISPLAY_LINE_HEIGHT_RATIO = 1.1;

/**
 * `Ok Mallang B` 전용 사이즈. Figma 에 Heading/Body 처럼 정식 텍스트 스타일이 없어서
 * (§8 "OK Mallang B has no registered font-size scale") 인라인 값이 원칙이지만,
 * 러빈지옥 미니게임 화면에서 2곳 이상 재사용되는 값만 여기 토큰으로 올린다.
 *
 * `fill`/`stroke`도 Figma에 인스턴스별로 박혀 있는 실제 값이다(코드젠 도구가 텍스트 stroke를
 * CSS로 뽑아주지 않아 스크린샷을 픽셀 단위로 확인해 값을 구했다 — Figma 인스펙터의 정확한 px
 * 값과 다를 수 있으니 추후 실제 값을 알게 되면 여기만 고치면 된다). 이 색/두께는 텍스트마다
 * 다를 수 있어(§8) 절대 서로 재사용하지 않는다 — title은 pink-200 얇은 테두리, score는 진한
 * 검정 두꺼운 테두리로 서로 다르다.
 */
export const display = {
  /** EP5 `REPORT`/`HIGHLIGHT` (5748:4322, 5760:4358): 22px, pink-500 fill, 얇은 pink-200 stroke. */
  sectionTitle: {
    fontFamily: fontFamily.okMallangB,
    fontSize: 22,
    lineHeight: 22 * lineHeightRatio,
    fill: pink[500],
    stroke: { color: pink[200], width: 1 },
  },
  /** "Ready?" / "Game Over" 오버레이 타이틀. Figma: 6285:6955, 6263:6495 등 40px, pink-500 위 pink-200 stroke ~2px. */
  title: {
    fontFamily: fontFamily.okMallangB,
    fontSize: 40,
    lineHeight: 40 * DISPLAY_LINE_HEIGHT_RATIO,
    fill: pink[500],
    stroke: { color: pink[200], width: 2 },
  },
  /** 게임 프레임 좌상단 기록 카운터. Figma: 6285:7097, 6263:6384 등 28px, white 위 black(#1D1D1D) stroke ~3px. */
  score: {
    fontFamily: fontFamily.okMallangB,
    fontSize: 28,
    lineHeight: 28 * DISPLAY_LINE_HEIGHT_RATIO,
    fill: defaultColor.white,
    stroke: { color: defaultColor.black, width: 3 },
  },
  /**
   * 화면 제목 로고 글자. "Luvin's Inferno"(오븐) · "Luvin EmoDi"(감정일기 홈 5950:6590) 24px,
   * pink-500 위 pink-200 아주 얇은 stroke ~1px. 두 곳에서 같은 값이라 토큰으로 올렸다.
   */
  logo: {
    fontFamily: fontFamily.okMallangB,
    fontSize: 24,
    lineHeight: 24 * DISPLAY_LINE_HEIGHT_RATIO,
    fill: pink[500],
    stroke: { color: pink[200], width: 1 },
  },
};

export const typography = { fontFamily, heading, body, display };

// --- 아래는 tailwind.config.js 가 그대로 쓰는 형태로 위 값에서 파생시킨 것 ---

/** tailwind.config.js 의 fontSize 항목 형태: [크기, { lineHeight }] */
type TailwindFontSize = [string, { lineHeight: string }];

const toTailwindFontSize = (size: number, ratio: number = lineHeightRatio): TailwindFontSize => [
  `${size}px`,
  // '160%' 로 쓰면 react-native-css-interop 이 버리므로 단위 없는 숫자 문자열을 쓴다.
  { lineHeight: String(ratio) },
];

/**
 * `font-yde-street-b` / `font-yde-street-l`. Ok Mallang B는 여기 없다 — `font-ok-mallang-b`
 * Tailwind 클래스는 실기기에서 항상 폰트가 깨진다(위 `fontFamily.okMallangB` 주석 참고).
 * display-*는 테두리(stroke)까지 있어 애초에 Tailwind 클래스가 아니라 `OkMallangBText`
 * 컴포넌트가 `display.title`/`display.score` 토큰을 style로 직접 읽어 그린다.
 */
export const tailwindFontFamily = {
  'yde-street-b': [fontFamily.ydeStreetB],
  'yde-street-l': [fontFamily.ydeStreetL],
};

/** `text-heading-h1` / `text-body-m` 등 */
export const tailwindFontSize: Record<string, TailwindFontSize> =
  Object.fromEntries([
    ...Object.entries(heading).map(([key, v]): [string, TailwindFontSize] => [
      `heading-${key}`,
      toTailwindFontSize(v.fontSize),
    ]),
    ...Object.entries(body).map(([key, v]): [string, TailwindFontSize] => [
      `body-${key}`,
      toTailwindFontSize(v.fontSize),
    ]),
  ]);

export type Typography = typeof typography;
export type HeadingLevel = keyof typeof heading;
export type BodySize = keyof typeof body;
export type DisplaySize = keyof typeof display;
