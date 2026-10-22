/** [DRAFT] Episode body contract; UI never decides narrative outcomes. */
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
  | (Dialogue & { type: 'group' | 'pair' | 'interview' })
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
