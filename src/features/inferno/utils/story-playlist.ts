/**
 * [DRAFT] 회차 블록 목록을 재생 순서로 다듬는 순수 함수(§6).
 */
import type {
  ChoiceHistory,
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
