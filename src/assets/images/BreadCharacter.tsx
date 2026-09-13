import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

// expo-image 는 NativeWind 기본 매핑 대상이 아니라서 className -> style 을 직접 연결한다.
const InteropImage = cssInterop(Image, { className: 'style' });

/** 빵 종류. Figma 의 빵 캐릭터 에셋 파일명과 1:1 로 대응한다. */
export type BreadType =
  | 'salt'
  | 'castella'
  | 'madeleine'
  | 'redbean'
  | 'baguette'
  | 'cream'
  | 'donut'
  | 'pretzel';

/** 반죽(굽기 전) / 완성(구운 후) 상태. */
export type BreadState = 'dough' | 'baked';

// require 경로는 Metro 가 정적으로 읽어야 하므로 반드시 리터럴로 나열한다.
const BREAD_SOURCES: Record<BreadState, Record<BreadType, number>> = {
  dough: {
    salt: require('@/src/assets/images/dough_salt.png'),
    castella: require('@/src/assets/images/dough_castella.png'),
    madeleine: require('@/src/assets/images/dough_madeleine.png'),
    redbean: require('@/src/assets/images/dough_redbean.png'),
    baguette: require('@/src/assets/images/dough_baguette.png'),
    cream: require('@/src/assets/images/dough_cream.png'),
    donut: require('@/src/assets/images/dough_donut.png'),
    pretzel: require('@/src/assets/images/dough_pretzel.png'),
  },
  baked: {
    salt: require('@/src/assets/images/baked_salt.png'),
    castella: require('@/src/assets/images/baked_castella.png'),
    madeleine: require('@/src/assets/images/baked_madeleine.png'),
    // 에셋 파일명이 baked_redbeen 으로 오타가 나 있다. 파일명을 그대로 따른다.
    redbean: require('@/src/assets/images/baked_redbeen.png'),
    baguette: require('@/src/assets/images/baked_baguette.png'),
    cream: require('@/src/assets/images/baked_cream.png'),
    donut: require('@/src/assets/images/baked_donut.png'),
    pretzel: require('@/src/assets/images/baked_pretzel.png'),
  },
};

interface BreadCharacterProps {
  type: BreadType;
  state: BreadState;
  className?: string;
  accessibilityLabel?: string;
}

/**
 * 빵 캐릭터 이미지.
 *
 * 표정(눈/볼/입)은 png 에 이미 포함되어 있어서 별도 오버레이가 필요 없다.
 */
export default function BreadCharacter({
  type,
  state,
  className = 'h-[45px] w-[76px]',
  accessibilityLabel,
}: BreadCharacterProps) {
  return (
    <InteropImage
      className={className}
      source={BREAD_SOURCES[state][type]}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
