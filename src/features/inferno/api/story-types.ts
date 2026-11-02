/**
 * [DRAFT] `러빈지옥 회차` 태그 DTO. openapi 에서 생성된 타입(src/types/api-generated.ts)을
 * 이름만 짧게 다시 내보낸다 — 직접 손으로 옮기지 않아서 스펙이 바뀌면 재생성만 하면 된다(§19).
 */
import type { AiCharacterView } from '@/src/features/inferno/api/ai-season-types';
import type { components } from '@/src/types/api-generated';

type Schemas = components['schemas'];

export type AiEpisodeContentView = Schemas['AiEpisodeContentView'];
export type AiSceneBlockView = Schemas['AiSceneBlockView'];
export type AiStoryMessageView = Schemas['AiStoryMessageView'];
export type AiStoryParticipantView = Schemas['AiStoryParticipantView'];
export type AiStageIntroView = Schemas['AiStageIntroView'];
export type AiStoryStateView = Schemas['AiStoryStateView'];
export type AiChoiceOutcomeView = Schemas['AiChoiceOutcomeView'];
/** 선택 결과 장면 생성 상태(`choice`). 선택 응답과 `GET /me` 의 `story.choice` 에 온다. */
export type AiChoiceStatusView = Schemas['AiChoiceStatusView'];
export type AiChoiceHttpRequest = Schemas['AiChoiceHttpRequest'];
export type AiStoryFeedbackHttpRequest = Schemas['AiStoryFeedbackHttpRequest'];
export type AiStoryFeedbackView = Schemas['AiStoryFeedbackView'];
export type AiStoryLikeHttpRequest = Schemas['AiStoryLikeHttpRequest'];
export type AiMessageLikeView = Schemas['AiMessageLikeView'];

/**
 * 시즌 출연진(`characters[]`). 반죽 특징 한 줄(`description`)이 openapi 에 들어와서(라이브 스펙
 * 2026-10-26) 따로 덧붙이던 선택 필드를 없앴다. 이름은 부르는 곳이 많아 그대로 둔다.
 */
export type AiCharacterWithDescription = AiCharacterView;
export type PartnerLetterView = Schemas['PartnerLetterView'];

/**
 * `POST .../episodes/{order}/unlock` 응답. 1~3화나 이미 연 회차면 차감 없이 `unlocked: true`.
 * 시즌 상태는 들어 있지 않아서 열고 나면 `GET /me` 를 다시 받는다. 열어 둔 회차(`unlockedOrders`)와
 * 토큰 수(`episodeTokenCost`)는 `AiStoryStateView` 에 있다.
 */
export type AiEpisodeUnlockView = Schemas['AiEpisodeUnlockView'];

/** 409 `INSUFFICIENT_TOKENS` 의 `data`: 필요한 토큰(`required`)과 지금 잔액(`balance`). */
export type AiInsufficientTokensView = Schemas['AiInsufficientTokensView'];
