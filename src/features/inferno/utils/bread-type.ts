/**
 * [DRAFT] 서버 `breadType` 문자열 → 에셋 `BreadType`.
 *
 * 서버가 보낼 값 목록은 아직 백엔드에게 받지 못했다. 영문 키(`castella`)와 한글 이름
 * (`카스테라`) 둘 다 받아 주고, 모르는 값이면 기본 그림을 쓴다(사용자 결정). 값 목록이
 * 확정되면 ALIASES 만 고치면 된다.
 */
import type { BreadType } from '@/src/assets/images/BreadCharacter';
import { getBreadFlavorName } from '@/src/features/inferno/utils/character-persona';

const BREAD_TYPES: BreadType[] = [
  'salt',
  'castella',
  'madeleine',
  'redbean',
  'baguette',
  'cream',
  'donut',
  'pretzel',
];

/** 모르는 빵 종류일 때 쓰는 그림. */
export const DEFAULT_BREAD_TYPE: BreadType = 'cream';

/** 에셋 이름과 다른 영문 표기. */
const ALIASES: Record<string, BreadType> = {
  croissant: 'salt',
  redbeen: 'redbean',
};

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]/g, '');
}

export function toBreadType(value: string | null | undefined): BreadType {
  if (!value) return DEFAULT_BREAD_TYPE;
  const key = normalize(value);
  const direct = BREAD_TYPES.find((type) => type === key);
  if (direct) return direct;
  if (ALIASES[key]) return ALIASES[key];
  const byKoreanName = BREAD_TYPES.find((type) => key.includes(getBreadFlavorName(type)));
  return byKoreanName ?? DEFAULT_BREAD_TYPE;
}
