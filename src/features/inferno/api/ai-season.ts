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

/** `POST /api/ai/seasons`. 설문 완료 뒤 이 시즌을 한 번 만든다. */
export async function createSeason(representative: AiCharacterProfileRequest): Promise<AiSeasonStatusView> {
  const { data } = await httpClient.post<ApiEnvelope<AiSeasonStatusView>>('/api/ai/seasons', {
    representative,
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
