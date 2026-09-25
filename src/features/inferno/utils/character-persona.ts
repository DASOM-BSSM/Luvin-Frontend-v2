import type { BreadType } from '@/src/assets/images/BreadCharacter';

/**
 * AI 가 만든 캐릭터(성별/나이/성격만 있음, 이름·반죽타입 없음)를 화면에 필요한
 * "반죽 이름"으로 바꾼다. 기획 규칙: {형용사} {반죽 종류} 반죽 — 예: "유쾌한 카스테라 반죽".
 *
 * 형용사도 반죽 종류도 서버가 안 주므로 `characterId` 로 결정론적으로 고른다 — 그래야
 * 같은 캐릭터가 회차/화면을 옮겨 다녀도 항상 같은 이름·그림으로 보인다(진짜 랜덤이면
 * 렌더마다 달라져 버린다).
 */
const ADJECTIVES = [
  '차가운',
  '따뜻한',
  '똑똑한',
  '조용한',
  '다정한',
  '진지한',
  '성숙한',
  '유쾌한',
  '귀여운',
  '도도한',
  '발랄한',
  '느긋한',
  '꼼꼼한',
  '섬세한',
  '솔직한',
  '엉뚱한',
  '털털한',
  '세련된',
  '쫀쫀한',
] as const;

const BREAD_TYPE_NOUN: Record<BreadType, string> = {
  salt: '소금빵 반죽',
  castella: '카스테라 반죽',
  donut: '도넛 반죽',
  pretzel: '프레첼 반죽',
  baguette: '바게트 반죽',
  cream: '크림빵 반죽',
  redbean: '팥빵 반죽',
  madeleine: '마들렌 반죽',
};

const BREAD_TYPES = Object.keys(BREAD_TYPE_NOUN) as BreadType[];

export interface CharacterPersona {
  type: BreadType;
  name: string;
}

/** 문자열을 32비트 정수 해시로 뭉갠다. 암호화 목적이 아니라 결정론적 분산만 필요하다. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** characterId 하나당 항상 같은 {형용사}+{반죽 종류} 조합을 돌려준다. */
export function deriveCharacterPersona(characterId: string): CharacterPersona {
  const hash = hashString(characterId);
  const type = BREAD_TYPES[hash % BREAD_TYPES.length];
  // 형용사는 반죽 종류와 다른 자리수를 써서 같은 해시로 둘 다 고를 때 편향되지 않게 한다.
  const adjective = ADJECTIVES[Math.floor(hash / BREAD_TYPES.length) % ADJECTIVES.length];

  return { type, name: `${adjective} ${BREAD_TYPE_NOUN[type]}` };
}

/**
 * 형용사 없는 "{반죽 종류} 반죽" 만 돌려준다. 매칭 결과 쪽지의 버튼 문구(예: "도넛 반죽과
 * 오븐 가기")처럼 조사가 이름 뒤에 바로 붙어야 하는 자리에 쓴다 — 모든 값이 "반죽"으로
 * 끝나 받침이 있으므로 "과" 조사를 그대로 붙여도 항상 맞다.
 */
export function getBreadTypeNoun(type: BreadType): string {
  return BREAD_TYPE_NOUN[type];
}
