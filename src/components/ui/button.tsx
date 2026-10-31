import { Pressable, type PressableProps } from 'react-native';

import Text, { type TextVariant } from '@/src/components/ui/text';

/**
 * Figma 에 Button 컴포넌트가 따로 없어서(전부 일반 프레임) 화면별 인스턴스에서 뽑았다.
 * - `outline`         : 밝은 배경 + 검은 테두리 (홈 카드 안의 작은 버튼)
 * - `filled`          : 노란 배경 + 노란 테두리 (홈 카드 안의 작은 버튼)
 * - `primary`         : 온보딩 로그인 버튼 (6031:2839) — yellow/400, 높이 38, 가로 꽉
 * - `secondary`       : 설문 시작하기 버튼 (6248:5304) — yellow/300, 높이 42, 가로 꽉
 * - `modeSelect`      : 러빈지옥 "Choose Your Mode" 화면(5916:5300)의 게임 버튼 — yellow/300,
 *   테두리 없음, px20/py8, 라벨 16px. 2026-10-30 사용자 결정으로 시안대로 항상 노란색이다
 *   (예전에는 평소 흰색 + 누르는 동안만 노란색으로 이탈해 있었다).
 * - `gameInfo`        : 미니게임 Ready/Result 화면의 "게임 설명" 버튼(6285:7061 등) — bg white,
 *   테두리 gray, py-6, 라벨 14px. `outline`과 border/폰트 크기가 달라 분리했다.
 * - `notice`          : 안내 모달 버튼 (6602:3957) — yellow/300 바탕에 yellow/400 테두리, 가로 꽉
 * - `noticeFit`       : `notice` 와 생김새가 같고 폭만 다르다 — `w-full`(부모의 100%) 대신
 *   `self-stretch` 로 옆 글자 폭에 맞춰 늘어난다. 폭이 정해지지 않고 글에 맞춰 늘어나는 상자
 *   (러빈지옥 쪽지 모달) 안에서 `w-full` 을 쓰면, 레이아웃 엔진이 100% 를 "쓸 수 있는 최대 폭"
 *   기준으로 재서 상자가 글과 무관하게 최대 폭까지 늘어났다(사용자 지적). 그래서 분리했다.
 * - `noticeSoft`      : `notice` 의 한 단계 연한 짝 (5482:1895) — yellow/200 바탕에 yellow/300
 *   테두리. Figma `button2` 의 `status=activate, hover=off` 에 해당하고, `notice` 가 그
 *   `hover=on` 이다. "나의 빵에게" 피드백 화면처럼 두 버튼이 한 화면에 같이 놓일 때 쓴다.
 * - `filledSelected`  : `filled` 의 고른 상태. 감정일기 홈 "오늘의 밸런스 게임" 보기 버튼
 *   (5746:4119, `hover=on` 2013:78) — yellow/300 바탕에 yellow/400 테두리. `notice` 와 색은 같지만
 *   `notice` 는 가로 꽉 + px16 이라 나란히 놓는 보기 버튼에는 못 쓴다.
 * - `fieldAction`     : 입력칸 오른쪽 작은 버튼 — 그룹 설정하기의 "수정" · "복사"(6606:4064),
 *   일기 상세의 "전송"(5950:6013). yellow/300, 테두리 없음, px10/py8, 라벨 12px.
 * - `infoSave`        : 마이페이지 "내 정보 저장하기" 버튼 (6300:8070) — yellow/300, 테두리 없음,
 *   px10/py8, 라벨 14px, 가로 꽉. `secondary`(16px, 높이 42, px20)와 달라 분리했다.
 *
 * 이름은 Figma 가 아니라 이쪽에서 붙인 것이라, 디자인에 정식 Button 이 생기면 맞출 것.
 *
 * 비활성은 variant 가 아니라 `disabled` prop 이다 — Figma `button2` 도 색을 따로 둔 게 아니라
 * `status=deactivate`(5760:4346, default/gray) 라는 상태로 정의해 뒀다.
 */
export type ButtonVariant =
  | 'outline'
  | 'filled'
  | 'primary'
  | 'secondary'
  | 'modeSelect'
  | 'gameInfo'
  | 'notice'
  | 'noticeFit'
  | 'noticeSoft'
  | 'filledSelected'
  | 'fieldAction'
  | 'infoSave';

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  outline: 'border border-default-black bg-default-bg px-[20px] py-[6px]',
  filled: 'border border-yellow-300 bg-yellow-200 px-[20px] py-[6px]',
  primary: 'h-[38px] w-full bg-yellow-400 px-[10px]',
  secondary: 'h-[42px] w-full bg-yellow-300 px-[20px]',
  modeSelect: 'bg-yellow-300 px-[20px] py-[8px]',
  gameInfo: 'border border-default-gray bg-default-bg px-[20px] py-[6px]',
  notice: 'w-full border border-yellow-400 bg-yellow-300 px-[16px] py-[6px]',
  noticeFit: 'self-stretch border border-yellow-400 bg-yellow-300 px-[16px] py-[6px]',
  noticeSoft: 'w-full border border-yellow-300 bg-yellow-200 px-[16px] py-[6px]',
  filledSelected: 'border border-yellow-400 bg-yellow-300 px-[20px] py-[6px]',
  fieldAction: 'bg-yellow-300 px-[10px] py-[8px]',
  infoSave: 'w-full bg-yellow-300 px-[10px] py-[8px]',
};

/** 비활성일 때 덮어쓰는 바탕. Figma `status=deactivate` (5760:4346) 는 테두리 없이 회색이다. */
const DISABLED_CONTAINER = 'w-full border border-default-gray bg-default-gray px-[16px] py-[6px]';

/** 대부분 #1D1D1D 지만 Figma 가 서로 다른 토큰을 물려 놨다. */
const VARIANT_LABEL: Record<ButtonVariant, string> = {
  outline: 'text-default-black',
  filled: 'text-text-primary',
  primary: 'text-text-primary',
  secondary: 'text-default-black',
  modeSelect: 'text-default-black',
  gameInfo: 'text-text-primary',
  notice: 'text-text-primary',
  noticeFit: 'text-text-primary',
  noticeSoft: 'text-text-primary',
  filledSelected: 'text-default-black',
  fieldAction: 'text-text-primary',
  infoSave: 'text-text-primary',
};

const VARIANT_TEXT: Record<ButtonVariant, TextVariant> = {
  outline: 'body-xs',
  filled: 'body-xs',
  primary: 'body-m',
  secondary: 'body-m',
  modeSelect: 'body-m',
  gameInfo: 'body-s',
  notice: 'body-m',
  noticeFit: 'body-m',
  noticeSoft: 'body-m',
  filledSelected: 'body-xs',
  fieldAction: 'body-xs',
  infoSave: 'body-s',
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  /**
   * variant 가 정하는 기본 글자 크기를 덮어쓴다. variant 가 다른 두 버튼을 나란히 놓고
   * 글자 크기만 맞춰야 할 때 쓴다(예: outline=body-xs 옆에 secondary=body-m을 두면
   * 크기가 달라 보인다).
   */
  textVariant?: TextVariant;
}

export default function Button({
  label,
  variant = 'outline',
  textVariant,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const containerClass = disabled ? DISABLED_CONTAINER : VARIANT_CONTAINER[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-[8px] ${containerClass} ${className ?? ''}`}
      {...rest}
    >
      <Text variant={textVariant ?? VARIANT_TEXT[variant]} className={VARIANT_LABEL[variant]}>
        {label}
      </Text>
    </Pressable>
  );
}
