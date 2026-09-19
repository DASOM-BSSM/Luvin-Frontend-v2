import { Pressable, type PressableProps } from 'react-native';

import Text, { type TextVariant } from '@/src/components/ui/text';

/**
 * Figma 에 Button 컴포넌트가 따로 없어서(전부 일반 프레임) 화면별 인스턴스에서 뽑았다.
 * - `outline`         : 밝은 배경 + 검은 테두리 (홈 카드 안의 작은 버튼)
 * - `filled`          : 노란 배경 + 노란 테두리 (홈 카드 안의 작은 버튼)
 * - `primary`         : 온보딩 로그인 버튼 (6031:2839) — yellow/400, 높이 38, 가로 꽉
 * - `secondary`       : 설문 시작하기 버튼 (6248:5304) — yellow/300, 높이 42, 가로 꽉
 * - `modeSelectPrimary`/`modeSelectSecondary` : 러빈지옥 "Choose Your Mode" 화면(5916:5300)의
 *   두 게임 버튼 — `outline`/`filled`와 다르게 py-8, 라벨 16px, 테두리 gray. 공용 `outline`/
 *   `filled`를 재사용하면 다른 화면(홈 카드 등)까지 같이 바뀌므로 전용 variant로 분리했다.
 * - `gameInfo`        : 미니게임 Ready/Result 화면의 "게임 설명" 버튼(6285:7061 등) — bg white,
 *   테두리 gray, py-6, 라벨 14px. `outline`과 border/폰트 크기가 달라 분리했다.
 *
 * 이름은 Figma 가 아니라 이쪽에서 붙인 것이라, 디자인에 정식 Button 이 생기면 맞출 것.
 */
export type ButtonVariant =
  | 'outline'
  | 'filled'
  | 'primary'
  | 'secondary'
  | 'modeSelectPrimary'
  | 'modeSelectSecondary'
  | 'gameInfo';

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  outline: 'border border-default-black bg-default-bg px-[20px] py-[6px]',
  filled: 'border border-yellow-300 bg-yellow-200 px-[20px] py-[6px]',
  primary: 'h-[38px] w-full bg-yellow-400 px-[10px]',
  secondary: 'h-[42px] w-full bg-yellow-300 px-[20px]',
  modeSelectPrimary: 'border border-default-gray bg-yellow-300 px-[20px] py-[8px]',
  modeSelectSecondary: 'border border-default-gray bg-default-bg px-[20px] py-[8px]',
  gameInfo: 'border border-default-gray bg-default-bg px-[20px] py-[6px]',
};

/** 대부분 #1D1D1D 지만 Figma 가 서로 다른 토큰을 물려 놨다. */
const VARIANT_LABEL: Record<ButtonVariant, string> = {
  outline: 'text-default-black',
  filled: 'text-text-primary',
  primary: 'text-text-primary',
  secondary: 'text-default-black',
  modeSelectPrimary: 'text-default-black',
  modeSelectSecondary: 'text-default-black',
  gameInfo: 'text-text-primary',
};

const VARIANT_TEXT: Record<ButtonVariant, TextVariant> = {
  outline: 'body-xs',
  filled: 'body-xs',
  primary: 'body-m',
  secondary: 'body-m',
  modeSelectPrimary: 'body-m',
  modeSelectSecondary: 'body-m',
  gameInfo: 'body-s',
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
}

/**
 * NOTE: Figma 에 pressed / disabled / loading 상태 정의가 아직 없어서 기본 상태만 구현했다.
 * 상태 디자인이 나오면 여기에 추가할 것.
 */
export default function Button({ label, variant = 'outline', className, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center justify-center rounded-[8px] ${VARIANT_CONTAINER[variant]} ${className ?? ''}`}
      {...rest}
    >
      <Text variant={VARIANT_TEXT[variant]} className={VARIANT_LABEL[variant]}>
        {label}
      </Text>
    </Pressable>
  );
}
