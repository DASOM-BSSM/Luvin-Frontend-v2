/** [DRAFT] 목 서버(story-mock.ts) 안에서만 쓰는 옛 블록 타입. 화면은 types/story.ts 를 쓴다. */
import type { InfernoChatMessage, InfernoParticipant } from '@/src/features/inferno/types';
export type ChoicePoint = 1 | 2 | 3 | 4;
export type StoryRoute = 'romance' | 'solo' | null;
export interface ChoiceRecord {
  pointId: ChoicePoint;
  order: number;
  breadId: string | null;
  accepted: boolean;
  reason: string;
}
export interface SceneSeasonState {
  route: StoryRoute;
  choices: ChoiceRecord[];
  rejectCount: Record<string, number>;
}
export interface ChoiceBlock {
  pointId: ChoicePoint;
  question: string;
  candidates: { breadId: string; memory: string }[];
}
type Dialogue = { id: string; participants: InfernoParticipant[]; messages: InfernoChatMessage[] };
export type SceneBlock =
  | { id: string; type: 'transition'; text: string }
  | (Dialogue & { type: 'group' | 'pair' })
  // 인터뷰는 화면 위에 질문을 띄우고, 아래에 답하는 빵과 자막을 둔다.
  /** 인터뷰. breadId 는 질문 대상 빵(답은 내 빵이 한다). */
  | (Dialogue & { type: 'interview'; breadId: string })
  | (Dialogue & {
      type: 'messenger';
      roomName: string;
      kind: 'group' | 'direct';
      events: Record<string, 'read' | 'typing' | 'deleted'>;
    })
  | { id: string; type: 'choice'; choice: ChoiceBlock }
  | (Dialogue & { type: 'choice_result'; result: ChoiceRecord });
export interface EpisodeContent {
  order: number;
  blocks: SceneBlock[];
}
