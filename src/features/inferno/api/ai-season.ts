import httpClient from '@/src/lib/http-client';
import type { ApiEnvelope } from '@/src/lib/api-envelope';

import type {
  AiCharacterProfileRequest,
  AiEpisodeMessagesView,
  AiEpisodeProgressView,
  AiRerollView,
  AiSeasonStatusView,
  AiSelectionView,
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
  return data.data;
}

/** `GET /api/ai/seasons/me`. */
export async function getSeasonStatus(): Promise<AiSeasonStatusView> {
  const { data } = await httpClient.get<ApiEnvelope<AiSeasonStatusView>>('/api/ai/seasons/me');
  return data.data;
}

/** `GET /api/ai/seasons/episodes/{number}`. */
export async function getEpisodeMessages(
  episodeNumber: number,
  params?: { afterSequence?: number; limit?: number },
): Promise<AiEpisodeMessagesView> {
  const { data } = await httpClient.get<ApiEnvelope<AiEpisodeMessagesView>>(
    `/api/ai/seasons/episodes/${episodeNumber}`,
    { params: { after_sequence: params?.afterSequence, limit: params?.limit } },
  );
  return data.data;
}

/** `POST /api/ai/seasons/episodes/{number}/generations`. AI 에게 이 회차 대화를 만들라고 시킨다. */
export async function requestEpisodeGeneration(episodeNumber: number): Promise<AiEpisodeProgressView> {
  const { data } = await httpClient.post<ApiEnvelope<AiEpisodeProgressView>>(
    `/api/ai/seasons/episodes/${episodeNumber}/generations`,
  );
  return data.data;
}

/** `POST /api/ai/seasons/episodes/{number}/seen`. */
export async function markMessagesSeen(episodeNumber: number, sequence: number): Promise<void> {
  await httpClient.post(`/api/ai/seasons/episodes/${episodeNumber}/seen`, { sequence });
}

/** `POST /api/ai/seasons/episodes/{number}/rerolls`. "다시 굽기". */
export async function requestReroll(episodeNumber: number, partnerId: string): Promise<AiRerollView> {
  const { data } = await httpClient.post<ApiEnvelope<AiRerollView>>(
    `/api/ai/seasons/episodes/${episodeNumber}/rerolls`,
    { partnerId },
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
