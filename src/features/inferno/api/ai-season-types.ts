/**
 * `ai-season-controller` DTO. openapi 스키마를 그대로 옮긴 것 — UI 가 쓰는
 * `InfernoConversation` 등과는 별개다. 화면에 보여줄 모양으로 바꾸는 건
 * `utils/map-ai-episode.ts` 가 한다.
 */

export interface AiTraitsRequest {
  affectionExpression: number;
  relationshipAnxiety: number;
  relationshipAvoidance: number;
  emotionalAttunement: number;
  relationshipInitiative: number;
  practicalPriority: number;
  reassuranceNeed: number;
  jealousyReactivity: number;
  relationshipEnergyDependence: number;
  emotionalSuppression: number;
  conflictConfrontation: number;
  relationshipPace: number;
  interestExpressionFrequency: number;
}

export interface AiCharacterProfileRequest {
  gender: string;
  traits: AiTraitsRequest;
}

export interface AiCharacterView {
  characterId: string;
  /**
   * "나"(내 분신)인지 상대 후보인지 구분하는 값. 실제 응답으로 확인 완료 —
   * 대표(나)는 `'REPRESENTATIVE'`, 후보는 `'CANDIDATE'`(둘 다 대문자, § map-ai-episode.ts 참고).
   */
  role: string;
  gender: string;
}

export interface AiSeasonStatusView {
  seasonId: string;
  revision: number;
  currentEpisode: number;
  status: string;
  characters: AiCharacterView[];
  /** 이 시즌을 만든 설문 결과. 옛 경로(`POST /api/ai/seasons`)로 만든 시즌엔 없다. */
  sourceSurveyResultId?: string;
  /** 몇 번째 시즌인지(1부터). `POST /api/ai/seasons/next`로 다음 시즌을 열 때마다 늘어난다. */
  seasonNumber?: number;
}

/** `GET /api/ai/seasons` 의 한 줄. 지금까지 연 시즌들(지난 시즌 포함)의 요약이다. */
export interface AiSeasonSummaryView {
  seasonId: string;
  /** 몇 번째 시즌인지(1부터). */
  seasonNumber?: number;
  status: string;
  currentEpisode: number;
  createdAt?: string;
  /** 끝난 시즌만 있다. */
  completedAt?: string;
}

/** `POST /api/ai/seasons/next` 요청 본문. 둘 다 생략 가능하다. */
export interface StartNextSeasonRequest {
  /** 새 시즌의 원천이 될 설문 결과. 생략하면 서버가 최신 결과를 쓴다. */
  surveyResultId?: string;
  /** 같은 "다음 시즌 시작" 시도를 재시도해도 시즌이 두 번 생기지 않게 하는 멱등 키. */
  clientRequestId?: string;
}

export interface AiMessageView {
  messageId: string;
  sequence: number;
  sceneKind: string;
  speakerId: string;
  fromRepresentative: boolean;
  text: string;
}

export interface AiTopicView {
  id: string;
  title: string;
  category: string;
}

export interface AiEpisodeMessagesView {
  episodeNumber: number;
  versionId: string;
  topic: AiTopicView;
  messages: AiMessageView[];
  hasMore: boolean;
  nextAfterSequence?: number;
  /** 이 회차에 남긴 "나의 빵에게" 피드백. 아직 안 썼으면 없다. */
  feedback?: AiEpisodeFeedbackView | null;
  /** 이 회차 1:1 대화에서 하트를 누른 줄(`AiMessageView.messageId`) 목록. */
  likedMessageIds?: string[];
}

/** `POST /api/ai/seasons/episodes/{number}/likes` 요청 본문. */
export interface EpisodeMessageLikeHttpRequest {
  /** 하트를 켜거나 끌 1:1 대화 한 줄. `AiMessageView.messageId` 그대로. */
  messageId: string;
}

/** 하트를 켜고 끈 뒤의 상태. */
export interface AiMessageLikeView {
  messageId: string;
  liked: boolean;
}

/** `POST /api/ai/seasons/episodes/{number}/feedback` 요청 본문. */
export interface EpisodeFeedbackHttpRequest {
  /** 피드백할 1:1 대화 한 줄. `AiMessageView.messageId` 그대로. */
  messageId: string;
  /** 피드백 글. 최대 1000자. */
  content?: string;
}

/** 저장된 "나의 빵에게" 피드백. */
export interface AiEpisodeFeedbackView {
  messageId: string;
  content: string;
  createdAt: string;
}

export interface AiEpisodeProgressView {
  episodeNumber: number;
  jobId: string;
  jobStatus: string;
  versionId?: string;
  errorCode?: string;
}

export interface AiRerollView {
  jobId: string;
  jobStatus: string;
  errorCode?: string;
}

export interface AiSelectionView {
  selectionId: string;
  partnerId: string;
  revision: number;
}

/** `GET /api/ai/seasons/report`의 `highlights` 배열 원소 하나. */
export interface AiHighlightView {
  messageId: string;
  text: string;
}

/** `GET /api/ai/seasons/report`. */
export interface AiReportView {
  finalPartnerId: string;
  highlights: AiHighlightView[];
  narrative: string;
  renderMode: string;
}
