/** [DRAFT] 투표지 선택지 만들기. 순수 함수(§6). */
import type { BreadType } from '@/src/assets/images/BreadCharacter';
import type { StoryChoice, StoryParticipant } from '@/src/features/inferno/types/story';

const SOLO_NAME = '혼자 있기';

export interface VoteOption {
  /** 빵 id. 혼자 있기는 null. */
  id: string | null;
  name: string;
  caption?: string;
  breadType?: BreadType;
  /** VOTE 확인 모달 문구. Figma 7866:4215 "○○ 반죽에게". */
  voteMessage: string;
}

/** 후보 빵 순서대로, 마지막에 혼자 있기. 혼자 있기는 그림 없이 이름만. */
export function voteOptionsOf(choice: StoryChoice, participants: StoryParticipant[]): VoteOption[] {
  const candidates = choice.candidates.map((candidate): VoteOption => {
    const person = participants.find((item) => item.id === candidate.breadId);
    const name = person?.name ?? '';
    return {
      id: candidate.breadId,
      name,
      caption: candidate.memory || undefined,
      breadType: person?.type,
      voteMessage: `${name}에게`,
    };
  });
  return [...candidates, { id: null, name: SOLO_NAME, voteMessage: SOLO_NAME }];
}

/** 8화 선택(④). 출연진 다섯이 모두 후보로 나온다(사용자 결정). */
export const OPEN_VOTE_POINT = 4;

/** 투표지 첫 줄 안내. 후보가 이성 셋인 3·5·6화만 시안 문구, 8화는 친구가 있어 없다. Figma 7870:4574. */
export function voteNoticeOf(pointId: number): string | undefined {
  return pointId === OPEN_VOTE_POINT ? undefined : '이번 투표에는 이성 반죽들로만 구성되어있어요';
}

/**
 * 투표지 둘째 줄 도움말(사용자 결정). 3·5·6화는 혼자 있기를 고르면 다음 1:1 상대가 친구라서(계약 v5 7장)
 * 그 안내를 띄운다. 8화는 친구가 후보에 직접 있어서 없다.
 */
export function voteHintOf(pointId: number): string | undefined {
  return pointId === OPEN_VOTE_POINT ? undefined : '혼자 있기를 선택하면 동성 단짝 친구와 이야기 할 수 있어요';
}
