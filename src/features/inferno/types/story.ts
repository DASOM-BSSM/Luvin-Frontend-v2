/**
 * [DRAFT] 새 10화 흐름의 앱 내부 타입.
 *
 * 서버 응답(openapi `AiEpisodeContentView` 등, api/story-types.ts)을 그대로 쓰지 않고
 * utils/map-story.ts 가 이 모양으로 바꿔서 화면에 넘긴다. 기존 대화 컴포넌트가 받는
 * `InfernoChatMessage`·`InfernoParticipant` 를 그대로 확장해서 재사용한다.
 *
 * 애착 유형(attachmentStyle)은 여기에 두지 않는다 — 화면 어디에도 보이면 안 되는 값이라
 * 변환 단계에서 버린다(계약 0장).
 */
import type { BreadType } from '@/src/assets/images/BreadCharacter';
import type { InfernoChatMessage, InfernoParticipant } from '@/src/features/inferno/types';

export type SeasonSetting = 'school' | 'campus' | 'office' | 'cafe';
export type StoryRoute = 'romance' | 'solo';
/** 3화, 5화, 6화, 8화 끝의 선택. */
export type ChoicePoint = 1 | 2 | 3 | 4;
export type StoryMessageKind = 'chat' | 'monologue' | 'narration';

export interface StoryParticipant extends InfernoParticipant {
  /** 이 배경에서의 역할. 예: "같은 반 반장". 내 빵은 null. */
  stageRole: string | null;
}

export interface StoryMessage extends InfernoChatMessage {
  kind: StoryMessageKind;
  sequence: number;
  /** messenger 전용 연출. */
  read: boolean;
  typing: boolean;
  deletedAfterSend: boolean;
}

interface DialogueBlock {
  id: string;
  participants: StoryParticipant[];
  messages: StoryMessage[];
}

export interface StoryChoice {
  pointId: ChoicePoint;
  question: string;
  /** "혼자 있기"는 여기 없다 — 앱이 모든 선택에 붙인다. */
  candidates: { breadId: string; memory: string }[];
}

export interface ChoiceOutcome {
  pointId: ChoicePoint;
  /** null = 혼자 있기. */
  breadId: string | null;
  accepted: boolean;
}

export type StoryBlock =
  | { id: string; type: 'transition'; text: string }
  | (DialogueBlock & { type: 'group' | 'pair' })
  | (DialogueBlock & { type: 'messenger'; kind: 'group' | 'direct'; roomName: string })
  | (DialogueBlock & { type: 'interview'; breadId: string })
  | { id: string; type: 'choice'; choice: StoryChoice }
  | (DialogueBlock & { type: 'choice_result'; result: ChoiceOutcome });

export interface EpisodeIntro {
  title: string;
  situation: string;
}

export interface StageCastMember {
  breadId: string;
  name: string;
  type: BreadType;
  role: string;
  description: string | null;
}

export interface StageIntro {
  setting: SeasonSetting | null;
  title: string;
  subtitle: string;
  cast: StageCastMember[];
}

export type EpisodeStatus = 'ready' | 'generating' | 'failed';

export interface EpisodeContent {
  order: number;
  status: EpisodeStatus;
  errorCode: string | null;
  intro: EpisodeIntro | null;
  /** 1화에만 있다. */
  stageIntro: StageIntro | null;
  blocks: StoryBlock[];
  /** 이미 완료한 회차면 다시 보기 모드. */
  completed: boolean;
  /** 메시지 id → 남긴 피드백 글. */
  feedbacks: Record<string, string>;
  likedMessageIds: string[];
}

export interface ChoiceHistory extends ChoiceOutcome {
  order: number;
}

export interface StoryBread {
  breadId: string;
  name: string;
  /** 2~6자 관계 문구. 예: "친해짐" */
  statusText: string;
}

export interface StoryState {
  setting: SeasonSetting | null;
  currentOrder: number;
  completedOrders: number[];
  route: StoryRoute | null;
  romancePartnerId: string | null;
  choices: ChoiceHistory[];
  breads: StoryBread[];
  /** [DRAFT] 열어 둔 회차. 1~3화는 무료라 열지 않아도 된다. */
  unlockedOrders: number[];
  /** [DRAFT] 4화 이상을 처음 열 때 드는 토큰 수(서버 값). 아직 모르면 null. */
  episodeTokenCost: number | null;
}

export interface ChoiceSubmission {
  /** 선택 블록 바로 뒤에 이어서 재생한다. 거절이면 대체 pair 블록이 붙어 온다. */
  blocks: StoryBlock[];
  season: StoryState;
}
