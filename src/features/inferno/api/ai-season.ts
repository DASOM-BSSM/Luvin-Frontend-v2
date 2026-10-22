import httpClient from '@/src/lib/http-client';
import type { ApiEnvelope } from '@/src/lib/api-envelope';
import { useAuthStore } from '@/src/features/auth/store/auth-store';

import type {
  AiCharacterProfileRequest,
  AiEpisodeFeedbackView,
  AiEpisodeMessagesView,
  AiEpisodeProgressView,
  AiMessageLikeView,
  AiReportView,
  AiSeasonStatusView,
  AiSeasonSummaryView,
  AiSelectionView,
  EpisodeFeedbackHttpRequest,
  EpisodeMessageLikeHttpRequest,
  StartNextSeasonRequest,
} from '@/src/features/inferno/api/ai-season-types';

/**
 * `POST /api/ai/seasons`. 앱이 traits를 직접 조립해서 보내는 옛 경로 — 서버 결과를
 * 우회하는 통로라 새 코드에서는 쓰지 않는다(SHARED_API_CONTRACT.md §7). 전환 기간 동안
 * 참조용으로만 남겨둔다.
 */
export async function createSeason(representative: AiCharacterProfileRequest): Promise<AiSeasonStatusView> {
  const { data } = await httpClient.post<ApiEnvelope<AiSeasonStatusView>>('/api/ai/seasons', {
    representative,
  });
  return data.data;
}

/**
 * `POST /api/ai/seasons/from-survey`. 서버가 이미 저장한 설문 결과(resultId)로 시즌을
 * 만든다 — 앱은 참조만 보내고, 성별/13개 점수는 서버가 그 결과에서 직접 읽는다
 * (SHARED_API_CONTRACT.md §7). 설문 제출과 같은 트랜잭션이 아니므로 실패해도 설문을
 * 다시 요구하지 않는다.
 */
export async function createSeasonFromSurvey(surveyResultId: string): Promise<AiSeasonStatusView> {
  const { data } = await httpClient.post<ApiEnvelope<AiSeasonStatusView>>('/api/ai/seasons/from-survey', {
    surveyResultId,
  });

  if (__DEV__) {
    // 계정별로 진짜 새 seasonId를 받는지(캐시 누수 아닌지) 만든 직후 바로 확인하기 위한 증거.
    const user = useAuthStore.getState().user;
    console.log(
      `[createSeasonFromSurvey] user=${user?.userId}(${user?.nickname}) surveyResultId=${surveyResultId} -> ` +
        `seasonId=${data.data.seasonId} currentEpisode=${data.data.currentEpisode} status=${data.data.status}`,
    );
  }

  return data.data;
}

/**
 * `POST /api/ai/seasons/next`. 지금 시즌을 마치고 다음 시즌을 연다(ep5 "다음 시즌 시작하기").
 * `from-survey`와 달리 이미 시즌이 있어도 그대로 돌려주지 않고 새 시즌을 만든다 — 그래서
 * 재시도가 시즌을 두 번 만들지 않도록 `clientRequestId`를 같이 보낸다.
 */
export async function startNextSeason(request: StartNextSeasonRequest): Promise<AiSeasonStatusView> {
  const { data } = await httpClient.post<ApiEnvelope<AiSeasonStatusView>>('/api/ai/seasons/next', request);
  return data.data;
}

/**
 * `GET /api/ai/seasons`. 지금까지 연 시즌 목록(지난 시즌 포함). 오븐 화면이 시즌마다 카드를
 * 따로 보여줄 때 쓴다.
 */
export async function listSeasons(): Promise<AiSeasonSummaryView[]> {
  const { data } = await httpClient.get<ApiEnvelope<AiSeasonSummaryView[]>>('/api/ai/seasons');
  return data.data;
}

/** `GET /api/ai/seasons/me`. */
export async function getSeasonStatus(): Promise<AiSeasonStatusView> {
  const { data } = await httpClient.get<ApiEnvelope<AiSeasonStatusView>>('/api/ai/seasons/me');

  if (__DEV__) {
    // 계정 바꿔도 같은 시즌이 보인다는 걸 확인/반박하기 위한 증거 — 진짜 다른 유저로
    // 로그인됐는지(userId)와 그 유저가 실제로 어떤 seasonId를 받는지 같이 찍는다.
    const user = useAuthStore.getState().user;
    console.log(
      `[getSeasonStatus] user=${user?.userId}(${user?.nickname}) seasonId=${data.data.seasonId} ` +
        `currentEpisode=${data.data.currentEpisode} status=${data.data.status}`,
    );
  }

  return data.data;
}

/** `GET /api/ai/seasons/episodes/{number}`. */
export async function getEpisodeMessages(
  episodeNumber: number,
  params?: { afterSequence?: number; limit?: number; seasonId?: string },
): Promise<AiEpisodeMessagesView> {
  const { data } = await httpClient.get<ApiEnvelope<AiEpisodeMessagesView>>(
    `/api/ai/seasons/episodes/${episodeNumber}`,
    {
      params: {
        after_sequence: params?.afterSequence,
        limit: params?.limit,
        // 지난 시즌 다시 보기(use-viewed-season). 생략하면 서버가 최신 시즌을 준다.
        season_id: params?.seasonId,
      },
    },
  );
  return data.data;
}

/** `POST /api/ai/seasons/episodes/{number}/generations`. AI 에게 이 회차 대화를 만들라고 시킨다. */
export async function requestEpisodeGeneration(episodeNumber: number): Promise<AiEpisodeProgressView> {
  const path = `/api/ai/seasons/episodes/${episodeNumber}/generations`;
  const response = await httpClient.post<ApiEnvelope<AiEpisodeProgressView>>(path);

  if (__DEV__) {
    // 백엔드가 "요청 자체가 안 왔다"고 할 때 대조할 증거 — 실제로 나간 절대 URL/상태코드/시각/유저.
    const user = useAuthStore.getState().user;
    console.log(
      `[requestEpisodeGeneration] POST ${response.config.baseURL ?? ''}${path} -> HTTP ${response.status} ` +
        `at ${new Date().toISOString()} user=${user?.userId}(${user?.nickname})`,
    );
  }

  return response.data.data;
}

/** `POST /api/ai/seasons/episodes/{number}/seen`. */
export async function markMessagesSeen(episodeNumber: number, sequence: number): Promise<void> {
  await httpClient.post(`/api/ai/seasons/episodes/${episodeNumber}/seen`, { sequence });
}

/**
 * `POST /api/ai/seasons/episodes/{number}/feedback`. "나의 빵에게" 피드백(ep2·ep4 의 1:1 대화).
 * `messageId`는 회차 조회(`GET .../episodes/{number}`)로 받은 메시지 id 를 그대로 보낸다.
 */
export async function submitEpisodeFeedback(
  episodeNumber: number,
  request: EpisodeFeedbackHttpRequest,
): Promise<AiEpisodeFeedbackView> {
  const { data } = await httpClient.post<ApiEnvelope<AiEpisodeFeedbackView>>(
    `/api/ai/seasons/episodes/${episodeNumber}/feedback`,
    request,
  );
  return data.data;
}

/**
 * `POST /api/ai/seasons/episodes/{number}/likes`. ep2·ep4 1:1 대화 한 줄의 하트를 켜고 끈다(토글).
 * 안 눌려 있으면 켜고, 눌려 있으면 끈다. 응답은 바뀐 뒤 상태다.
 */
export async function toggleEpisodeMessageLike(
  episodeNumber: number,
  request: EpisodeMessageLikeHttpRequest,
): Promise<AiMessageLikeView> {
  const { data } = await httpClient.post<ApiEnvelope<AiMessageLikeView>>(
    `/api/ai/seasons/episodes/${episodeNumber}/likes`,
    request,
  );
  return data.data;
}

/** `POST /api/ai/seasons/episodes/1/selection`. ep1 투표. */
export async function submitEpisode1Selection(partnerId: string): Promise<AiSelectionView> {
  const { data } = await httpClient.post<ApiEnvelope<AiSelectionView>>('/api/ai/seasons/episodes/1/selection', {
    partnerId,
  });
  return data.data;
}

/** `POST /api/ai/seasons/episodes/3/selection`. ep3 미니게임 결과 + 투표. */
export async function submitEpisode3Result(success: boolean, partnerId?: string): Promise<AiSelectionView> {
  const { data } = await httpClient.post<ApiEnvelope<AiSelectionView>>('/api/ai/seasons/episodes/3/selection', {
    success,
    partnerId,
  });
  return data.data;
}

/** [DRAFT] 기존 AI 시즌의 최종 리포트 조회. */
export async function getSeasonReport(seasonId?: string): Promise<AiReportView> {
  // 지난 시즌 다시 보기(use-viewed-season). 생략하면 서버가 최신 시즌을 준다.
  const { data } = await httpClient.get<ApiEnvelope<AiReportView>>('/api/ai/seasons/report', {
    params: { season_id: seasonId },
  });
  return data.data;
}
