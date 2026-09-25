/**
 * 타이포그래피 토큰.
 *
 * 출처: Figma "Luvin-Design" 의 로컬 텍스트 스타일 (`Heading/H1`~`H5`, `Body/XL`~`XXS`).
 * tailwind.config.js 가 이 파일을 require 해서 쓴다. 값은 여기서만 고칠 것.
 */

/**
 * Heading = "Yde street B", Body = "Yde street L" 로 서로 다른 패밀리를 쓴다.
 * RN 은 정적 폰트 파일 간 굵기 합성을 못 하므로 fontWeight 대신 패밀리를 나눈다.
 * 값 = ttf 의 PostScript 이름 = src/app/_layout.tsx 의 useFonts 키.
 */
export const fontFamily = {
  ydeStreetB: 'YdestreetB',
  ydeStreetL: 'YdestreetL',
};

/** Figma 텍스트 스타일 공통 line-height (160%) */
export const lineHeightRatio = 1.6;

/** Figma: `Heading/H1` ~ `Heading/H5` */
export const heading = {
  h1: {
    fontFamily: fontFamily.ydeStreetB,
    fontSize: 24,
    lineHeight: 24 * lineHeightRatio,
  },
  h2: {
    fontFamily: fontFamily.ydeStreetB,
    fontSize: 18,
    lineHeight: 18 * lineHeightRatio,
  },
  h3: {
    fontFamily: fontFamily.ydeStreetB,
    fontSize: 16,
    lineHeight: 16 * lineHeightRatio,
  },
  h4: {
    fontFamily: fontFamily.ydeStreetB,
    fontSize: 14,
    lineHeight: 14 * lineHeightRatio,
  },
  h5: {
    fontFamily: fontFamily.ydeStreetB,
    fontSize: 12,
    lineHeight: 12 * lineHeightRatio,
  },
};

/** Figma: `Body/XL` ~ `Body/XXS` */
export const body = {
  xl: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 18,
    lineHeight: 18 * lineHeightRatio,
  },
  l: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 16,
    lineHeight: 16 * lineHeightRatio,
  },
  m: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 14,
    lineHeight: 14 * lineHeightRatio,
  },
  s: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 12,
    lineHeight: 12 * lineHeightRatio,
  },
  xs: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 10,
    lineHeight: 10 * lineHeightRatio,
  },
  xxs: {
    fontFamily: fontFamily.ydeStreetL,
    fontSize: 8,
    lineHeight: 8 * lineHeightRatio,
  },
};

export const typography = { fontFamily, heading, body };

// --- 아래는 tailwind.config.js 가 그대로 쓰는 형태로 위 값에서 파생시킨 것 ---

/** tailwind.config.js 의 fontSize 항목 형태: [크기, { lineHeight }] */
type TailwindFontSize = [string, { lineHeight: string }];

const toTailwindFontSize = (size: number): TailwindFontSize => [
  `${size}px`,
  // '160%' 로 쓰면 react-native-css-interop 이 버리므로 단위 없는 숫자 문자열을 쓴다.
  { lineHeight: String(lineHeightRatio) },
];

/** `font-yde-street-b` / `font-yde-street-l` */
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
