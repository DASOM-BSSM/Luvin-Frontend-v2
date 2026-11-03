import httpClient from '@/src/lib/http-client';
import type { ApiEnvelope } from '@/src/lib/api-envelope';
import { useAuthStore } from '@/src/features/auth/store/auth-store';
import {
  mockGetSeasonReport,
  mockSeasonStory,
  resetMockServer,
} from '@/src/features/inferno/api/mocks/story-mock';
import { isStoryMock } from '@/src/features/inferno/api/story';
import { COMPLETED_SEASON_STATUS } from '@/src/features/inferno/constants/season';

import type { AiReportView, AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import type { components } from '@/src/types/api-generated';

/** 시즌 초기화 응답: 지운 시즌 수, 돌려받은 토큰, 지금 잔액. */
type AiSeasonResetView = components['schemas']['AiSeasonResetView'];

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
 * [DRAFT] `POST /api/ai/seasons/next`. 10화까지 끝낸 사용자가 다음 시즌을 연다(사용자 결정 — 시즌은
 * 이제 여러 개다). 스펙 2026-10-30 부터 동작한다(그 전엔 deprecated, 409 SEASON_COMPLETED).
 * `clientRequestId` 는 같은 요청이 두 번 와도 시즌이 두 개 생기지 않게 서버가 쓰는 멱등 키다.
 * `surveyResultId` 를 빼면 서버가 최신 설문 결과를 쓴다.
 * 목 모드면 목 서버 진행도를 처음으로 되돌린다.
 */
export async function startNextSeason(
  surveyResultId: string | undefined,
  clientRequestId: string,
): Promise<AiSeasonStatusView> {
  if (isStoryMock) {
    resetMockServer();
    return getSeasonStatus();
  }

  const { data } = await httpClient.post<ApiEnvelope<AiSeasonStatusView>>('/api/ai/seasons/next', {
    surveyResultId,
    clientRequestId,
  });
  return data.data;
}

/**
 * 시즌 초기화(`POST /api/ai/seasons/reset` — 정식 경로, 모든 서버). 시즌 행까지 모두 지운다(진행 중이든
 * 완료했든, 지난 시즌까지). 계정·설문 결과·감정일기·공유방·토큰은 남고, 4~10화를 열며 쓴 토큰은 **돌려주지
 * 않는다**(`refundedTokens` 는 늘 0). 예전에는 테스트용 `/api/dev/.../reset`(환불 있음)을 썼다.
 * 목 모드면 목 서버를 처음으로 되돌린다.
 */
export async function resetSeasons(): Promise<AiSeasonResetView> {
  if (isStoryMock) {
    resetMockServer();
    return { deletedSeasons: 1, refundedTokens: 0 };
  }

  const { data } = await httpClient.post<ApiEnvelope<AiSeasonResetView>>(
    '/api/ai/seasons/reset',
  );
  return data.data;
}

/** `GET /api/ai/seasons/me`. 목 모드(api/story.ts 의 isStoryMock)면 목 시즌을 돌려준다. */
export async function getSeasonStatus(): Promise<AiSeasonStatusView> {
  if (isStoryMock) {
    const mock = mockSeasonStory();
    return {
      seasonId: 'mock-season',
      revision: 1,
      currentEpisode: mock.story.currentOrder ?? 1,
      status: mock.completed ? COMPLETED_SEASON_STATUS : 'IN_PROGRESS',
      characters: mock.characters,
      episodeFormat: 'blocks',
      story: mock.story,
    };
  }

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

/** [DRAFT] 최종 리포트 조회(`GET /api/ai/seasons/report`). 10화를 완료하면 서버가 만든다. */
export async function getSeasonReport(): Promise<AiReportView> {
  if (isStoryMock) return mockGetSeasonReport();
  const { data } = await httpClient.get<ApiEnvelope<AiReportView>>('/api/ai/seasons/report');
  return data.data;
}
