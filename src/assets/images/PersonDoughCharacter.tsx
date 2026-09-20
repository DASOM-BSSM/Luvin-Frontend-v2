import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

import type { BreadType } from '@/src/assets/images/BreadCharacter';

const InteropImage = cssInterop(Image, { className: 'style' });

/**
 * "person 도우" 스타일 반죽 이미지 — 팔다리가 달린 버전. `BreadCharacter`(dough_*.png, 볼터치만
 * 있는 버전)와는 완전히 별도인 에셋 세트라 컴포넌트도 나눈다. 야바위·카드 뒤집기 미니게임에서
 * 쓴다(Figma 6478:3834 등).
 *
 * `dough` 상태만 있다 — baked 짝이 없다.
 *
 * `salt`는 이 세트에 salt 그림이 따로 없고 croissant 로 그려져 있다. `BreadCharacter`의
 * `dough_salt.png` 도 실제로는 크루아상 모양이라(§8 "소금빵" 캐릭터가 원래 크루아상 모양)
 * 같은 반죽을 가리키는 것이 맞다.
 */
const PERSON_DOUGH_SOURCES: Record<BreadType, number> = {
  salt: require('@/src/assets/images/person-dough/person_dough_croissant.png'),
  castella: require('@/src/assets/images/person-dough/person_dough_castella.png'),
  madeleine: require('@/src/assets/images/person-dough/person_dough_madeleine.png'),
  redbean: require('@/src/assets/images/person-dough/person_dough_redbean.png'),
  baguette: require('@/src/assets/images/person-dough/person_dough_baguette.png'),
  cream: require('@/src/assets/images/person-dough/person_dough_cream.png'),
  donut: require('@/src/assets/images/person-dough/person_dough_donut.png'),
  pretzel: require('@/src/assets/images/person-dough/person_dough_pretzel.png'),
};

interface PersonDoughCharacterProps {
  type: BreadType;
  className?: string;
  accessibilityLabel?: string;
}

/** person 도우 이미지. */
export default function PersonDoughCharacter({
  type,
  className = 'h-[45px] w-[76px]',
  accessibilityLabel,
}: PersonDoughCharacterProps) {
  return (
    <InteropImage
      className={className}
      source={PERSON_DOUGH_SOURCES[type]}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
