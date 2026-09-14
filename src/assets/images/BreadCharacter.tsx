import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

const InteropImage = cssInterop(Image, { className: 'style' });

/** 빵 종류. 에셋 파일명과 1:1 로 대응한다. */
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

/** 빵 캐릭터 이미지. */
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
