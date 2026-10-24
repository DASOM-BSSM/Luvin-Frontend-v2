/**
 * [DRAFT] 전체대화 위 반죽 칩을 눌렀을 때 보여줄 소개 한 장(순수 함수, §6).
 */
import type { BreadType } from '@/src/assets/images/BreadCharacter';
import type { AiCharacterWithDescription } from '@/src/features/inferno/api/story-types';
import type { StageCastMember, StoryParticipant } from '@/src/features/inferno/types/story';

/** 내 빵은 서버가 역할을 주지 않아서(stageRole null) 이 문구로 대신한다. Figma 7855:3328 "나". */
const MINE_ROLE = '나';

export interface DoughProfile {
  name: string;
  type: BreadType;
  /** 이름 아래 한 줄. 예: "나의 단짝친구". 모르면 null. */
  role: string | null;
  /** 점 목록으로 보여줄 특징. 예: ["우리반의 반장"]. */
  facts: string[];
}

/**
 * 대화 참가자 → 소개. 모든 회차에서 1화와 똑같이 관계·특징을 보여준다(사용자 결정).
 *
 * - 관계: 1화 무대 소개 출연진(시즌 단위로 저장해 둔 stageIntro.cast) → 참가자 stageRole → 내 빵이면 "나".
 * - 특징: 서버 시즌 출연진 `characters[].description`(백엔드 요청 중)이 있으면 그 값이 먼저,
 *   없으면 1화 무대 소개의 description. 시즌 출연진 `characterId` 는 참가자 `breadId` 와 같은 값이다
 *   (계약 v3 "출연진", 쪽지 partnerId ↔ characterId).
 */
export function doughProfileOf(
  person: StoryParticipant,
  stageCast: StageCastMember[],
  characters: AiCharacterWithDescription[],
): DoughProfile {
  const member = stageCast.find((item) => item.breadId === person.id);
  const serverDescription = characters.find((item) => item.characterId === person.id)?.description;
  const description = serverDescription || member?.description;
  const role = member?.role || person.stageRole || (person.isMine ? MINE_ROLE : null);
  return {
    name: person.name,
    type: person.type,
    role,
    facts: description ? [description] : [],
  };
}
