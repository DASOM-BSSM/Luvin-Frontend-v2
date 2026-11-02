/**
 * [DRAFT] 회차 블록 목록을 재생 순서로 다듬는 순수 함수(§6).
 */
import type {
  ChoiceHistory,
  StageCastMember,
  StoryBlock,
  StoryParticipant,
} from '@/src/features/inferno/types/story';

/** 대사가 없는 대화 블록은 건너뛴다. 혼자 있기 결과(`choice_result`, 대사 없음)가 여기에 해당한다. */
export function playableBlocks(blocks: StoryBlock[]): StoryBlock[] {
  return blocks.filter((block) => !('messages' in block) || block.messages.length > 0);
}

/**
 * 선택 응답의 블록을 선택 블록 바로 뒤에 끼운다. 같은 선택의 결과가 이미 있으면
 * (다시 받은 응답) 그 자리를 새 블록으로 바꾼다.
 */
export function insertChoiceBlocks(
  blocks: StoryBlock[],
  choiceBlockId: string,
  inserted: StoryBlock[],
): StoryBlock[] {
  const index = blocks.findIndex((block) => block.id === choiceBlockId);
  if (index < 0) return blocks;
  const insertedIds = new Set(inserted.map((block) => block.id));
  const rest = blocks.slice(index + 1).filter((block) => !insertedIds.has(block.id));
  return [...blocks.slice(0, index + 1), ...inserted, ...rest];
}

/** 회차에 나오는 빵 전부. 선택 카드처럼 참여자 목록이 없는 블록에서 이름·그림을 찾을 때 쓴다. */
export function castOf(blocks: StoryBlock[]): StoryParticipant[] {
  const cast = new Map<string, StoryParticipant>();
  blocks.forEach((block) => {
    if ('participants' in block)
      block.participants.forEach((person) => {
        if (!cast.has(person.id)) cast.set(person.id, person);
      });
  });
  return [...cast.values()];
}

/** 이 빵이 시즌 중에 한 번이라도 거절했는지. 10화 인터뷰 질문을 고를 때 쓴다. */
export function hasRejected(choices: ChoiceHistory[], breadId: string): boolean {
  return choices.some((choice) => choice.breadId === breadId && !choice.accepted);
}

/** 상대가 있는 1:1 장면인지. 피드백·좋아요는 이런 pair 블록에서만 된다(보정 문서 6장). */
export function isPairWithPartner(block: StoryBlock): boolean {
  return block.type === 'pair' && block.participants.some((person) => !person.isMine);
}

/** 피드백·좋아요를 남길 수 있는 줄: 상대가 있는 pair 블록의 내 빵 대사(독백·내레이션 제외). */
export function feedbackTargets(block: StoryBlock) {
  if (!isPairWithPartner(block) || !('messages' in block)) return [];
  const mine = new Set(block.participants.filter((person) => person.isMine).map((person) => person.id));
  return block.messages.filter((message) => message.kind === 'chat' && mine.has(message.participantId));
}

/** 회차 화면 바탕. 앞을 가리는 화면·선택·인터뷰는 쪽지 위에, 나머지 대화는 흰 바탕에 그린다. */
export function frameSurface(hasGate: boolean, block: StoryBlock | undefined): 'note' | 'plain' {
  return hasGate || block?.type === 'choice' || block?.type === 'interview' ? 'note' : 'plain';
}

/**
 * 전체대화 위 반죽 칩에 늘어놓을 출연진. 대화 블록마다 참가자 목록이 달라도 시즌 출연진 수는
 * 그대로 보여야 해서(사용자 결정) 블록 참가자가 아니라 시즌 전체를 쓴다.
 *
 * 순서: 1화 무대 소개 출연진(시즌 단위로 저장) → 이번 회차에만 나오는 빵 → 지금 블록에만 있는 빵.
 * 같은 빵이 회차 참가자에 있으면 그쪽 값(내 빵 여부, 내 빵 그림)을 쓴다.
 */
export function seasonChipCast(
  stageCast: StageCastMember[],
  episodeCast: StoryParticipant[],
  blockParticipants: StoryParticipant[],
): StoryParticipant[] {
  const known = new Map<string, StoryParticipant>();
  [...episodeCast, ...blockParticipants].forEach((person) => {
    if (!known.has(person.id)) known.set(person.id, person);
  });
  const result = new Map<string, StoryParticipant>();
  stageCast.forEach((member) => {
    result.set(
      member.breadId,
      known.get(member.breadId) ?? {
        id: member.breadId,
        name: member.name,
        type: member.type,
        isMine: false,
        stageRole: member.role || null,
      },
    );
  });
  known.forEach((person, id) => {
    if (!result.has(id)) result.set(id, person);
  });
  return [...result.values()];
}

/** 목록을 n 개씩 줄로 나눈다. 1화 등장인물 소개를 3명씩 두 줄로 놓을 때 쓴다. */
export function chunkRows<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) rows.push(items.slice(index, index + size));
  return rows;
}

/** Introduce 한 장에 놓는 인원. Figma Introduce 한 장이 세 마리다. */
export const INTRO_CAST_PAGE_SIZE = 3;

/** 1화 소개 한 장: 무대 제목, 또는 등장인물 세 명씩. */
export type IntroStep = { kind: 'stage' } | { kind: 'cast'; members: StageCastMember[] };

/** 1화 소개 순서. 무대 제목 → 등장인물(세 명씩 여러 장). 서버가 주지 않은 단계는 빠진다. */
export function introStepsOf(
  stageIntro: { cast: StageCastMember[] } | null | undefined,
): IntroStep[] {
  if (!stageIntro) return [];
  return [
    { kind: 'stage' },
    ...chunkRows(stageIntro.cast, INTRO_CAST_PAGE_SIZE).map(
      (members): IntroStep => ({ kind: 'cast', members }),
    ),
  ];
}
