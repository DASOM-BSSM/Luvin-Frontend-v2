/**
 * [DRAFT] `러빈지옥 회차` 태그 DTO. openapi 에서 생성된 타입(src/types/api-generated.ts)을
 * 이름만 짧게 다시 내보낸다 — 직접 손으로 옮기지 않아서 스펙이 바뀌면 재생성만 하면 된다(§19).
 */
import type { components } from '@/src/types/api-generated';

type Schemas = components['schemas'];

export type AiEpisodeContentView = Schemas['AiEpisodeContentView'];
export type AiSceneBlockView = Schemas['AiSceneBlockView'];
export type AiStoryMessageView = Schemas['AiStoryMessageView'];
export type AiStoryParticipantView = Schemas['AiStoryParticipantView'];
export type AiStageIntroView = Schemas['AiStageIntroView'];
export type AiStoryStateView = Schemas['AiStoryStateView'];
export type AiChoiceOutcomeView = Schemas['AiChoiceOutcomeView'];
export type AiChoiceHttpRequest = Schemas['AiChoiceHttpRequest'];
export type AiStoryFeedbackHttpRequest = Schemas['AiStoryFeedbackHttpRequest'];
export type AiStoryFeedbackView = Schemas['AiStoryFeedbackView'];
export type AiStoryLikeHttpRequest = Schemas['AiStoryLikeHttpRequest'];
export type AiMessageLikeView = Schemas['AiMessageLikeView'];

/**
 * [DRAFT] 시즌 출연진(`characters[]`)에 백엔드가 넣어 줄 예정인 반죽 특징 한 줄. 아직 openapi 에
 * 없어서 선택 필드로만 덧붙인다. 스펙에 들어오면 이 타입을 지우고 생성 타입을 그대로 쓸 것.
 */
export type AiCharacterWithDescription = Schemas['AiCharacterView'] & {
  description?: string | null;
};
export type PartnerLetterView = Schemas['PartnerLetterView'];

/**
 * [DRAFT] 회차 열기(토큰) 필드. 계약 v3 0장 "토큰 정책". 백엔드가 아직 만드는 중이라 openapi 에
 * 없다 — openapi 에 확정되면 이 타입과 api/story.ts 의 unlockEpisode 만 맞춰 고친다.
 */
export interface AiStoryUnlockFields {
  /** 열어 둔 회차(무료 회차 포함 여부는 서버가 정한다). */
  unlockedOrders?: number[];
  /** 4화 이상을 처음 열 때 드는 토큰 수. 앱에 하드코딩하지 않는다. */
  episodeTokenCost?: number;
}

/**
 * [DRAFT] `POST .../episodes/{order}/unlock` 응답(계약 v3). 1~3화나 이미 연 회차면 차감 없이
 * `unlocked: true`. 시즌 상태는 들어 있지 않아서 열고 나면 `GET /me` 를 다시 받는다.
 */
export interface AiEpisodeUnlockView {
  order?: number;
  unlocked?: boolean;
  /** 열고 난 뒤 남은 토큰. */
  tokenBalance?: number;
}
