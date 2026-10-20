import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import { getEpisodeMessages, requestEpisodeGeneration } from '@/src/features/inferno/api/ai-season';
import type { AiEpisodeMessagesView } from '@/src/features/inferno/api/ai-season-types';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import { useAuthStore } from '@/src/features/auth/store/auth-store';
import useGenerationTimeout from '@/src/features/inferno/hooks/use-generation-timeout';
import useViewedSeason from '@/src/features/inferno/hooks/use-viewed-season';
import { isEpisodeFullyGenerated } from '@/src/features/inferno/utils/map-ai-episode';

/** AI 생성이 아직 안 끝났을 때 다시 확인하는 간격. */
const GENERATION_POLL_MS = 3000;

/**
 * `GET .../episodes/{number}`는 이 회차의 generation 을 아직 한 번도 요청 안 했으면
 * 200+빈 배열이 아니라 **409**를 준다(백엔드 확인: "1화 generation이 아직 접수되지
 * 않았습니다"). 이걸 실패로 취급하면 아래 폴링/생성 요청 로직이 둘 다 안 걸리므로,
 * 여기서 흡수해서 "아직 없음"(null)으로 정규화한다 — 그 외 에러(네트워크/서버 오류 등)는
 * 그대로 던져서 기존 에러 처리가 그대로 동작하게 둔다.
 */
export async function fetchEpisodeMessagesOrNull(
  episodeNumber: number,
  /** 지난 시즌을 다시 볼 때만 넘긴다(use-viewed-season). */
  seasonId?: string,
): Promise<AiEpisodeMessagesView | null> {
  try {
    const data = await getEpisodeMessages(episodeNumber, { seasonId });
    if (__DEV__) {
      console.log(
        `[ep${episodeNumber}] messages=${data.messages.length} sceneKinds=${JSON.stringify(
          [...new Set(data.messages.map((m) => m.sceneKind))],
        )} ready=${isEpisodeFullyGenerated(episodeNumber, data.messages)}`,
      );
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      if (__DEV__) {
        console.log(`[ep${episodeNumber}] 409 (아직 generation 요청 전) -> null 로 취급`);
      }
      return null;
    }

    throw error;
  }
}

/** 생성 요청 응답의 `jobStatus`. 실제로 확인된 값은 `'FAILED'` 뿐이라 이것만 특별 취급한다. */
const FAILED_JOB_STATUS = 'FAILED';

/**
 * 회차 메시지. 아직 생성 전이면(409 → null, 또는 200+빈 배열) 생성을 한 번 요청하고,
 * 다 만들어질 때까지 짧게 폴링한다 — 생성 상태만 따로 조회하는 엔드포인트가 없어서
 * `GET .../episodes/{number}` 자체를 반복 호출해 확인하는 방식이다.
 *
 * 생성 요청 자체(`POST .../generations`)가 `jobStatus: 'FAILED'`로 응답하거나 요청 자체가
 * 실패하면(실제로 ep2에서 확인됨 — `errorCode: 'GENERATION_FAILED'`) `hasGenerationFailed`를
 * 켜고 폴링을 멈춘다 — 실패한 job을 기다리며 "만들고 있어요"에 영영 갇히는 걸 막는다.
 * 화면은 이때 안내와 함께 `retryGeneration`으로 다시 시도할 수 있게 해야 한다(§11).
 *
 * 서버가 실패를 알려주지도 않고 3분 넘게 결과를 안 주면(작업이 QUEUED 에서 멈춤) 그것도
 * 실패로 본다(use-generation-timeout) — 줄넘기 로더만 끝없이 도는 걸 막는다.
 *
 * 지난 시즌을 다시 볼 때(use-viewed-season)는 그 시즌 대화를 한 번 읽기만 한다. 생성 요청·폴링·
 * 시간 초과를 모두 하지 않는다 — 생성 요청은 늘 최신 시즌에 들어가서, 지난 시즌 화면에서 보내면 지금
 * 시즌 회차가 만들어진다.
 */
export default function useAiEpisodeMessages(episodeNumber: number, enabled = true) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { pastSeasonId, isPastSeason } = useViewedSeason();
  const hasRequestedGeneration = useRef(false);
  const [hasGenerationFailed, setHasGenerationFailed] = useState(false);

  const query = useQuery({
    queryKey: aiSeasonKeys.episode(episodeNumber, pastSeasonId),
    queryFn: () => fetchEpisodeMessagesOrNull(episodeNumber, pastSeasonId),
    enabled: isAuthenticated && enabled,
    refetchInterval: (currentQuery) => {
      if (hasGenerationFailed || isPastSeason) {
        return false;
      }

      const data = currentQuery.state.data;
      // ep2/ep4는 group만 먼저 와도 one_to_one이 없으면 미완성 — 그렇지 않으면 매칭 결과가
      // 영원히 안 내려온다(사용자 확인된 버그, isEpisodeFullyGenerated 주석 참고).
      const isReady = data != null && isEpisodeFullyGenerated(episodeNumber, data.messages);
      return isReady ? false : GENERATION_POLL_MS;
    },
  });

  const isEpisodeReady = query.data != null && isEpisodeFullyGenerated(episodeNumber, query.data.messages);
  useGenerationTimeout(
    query.isSuccess && !isEpisodeReady && !hasGenerationFailed && !isPastSeason,
    handleGenerationTimeout,
  );

  function handleGenerationTimeout() {
    if (__DEV__) {
      console.log(`[ep${episodeNumber}] 생성 대기 시간 초과 -> 실패로 처리`);
    }
    setHasGenerationFailed(true);
  }

  function triggerGeneration() {
    hasRequestedGeneration.current = true;
    if (__DEV__) {
      console.log(`[ep${episodeNumber}] POST generations 요청`);
    }
    requestEpisodeGeneration(episodeNumber)
      .then((result) => {
        if (__DEV__) {
          console.log(
            `[ep${episodeNumber}] generations 응답 jobStatus=${result.jobStatus} errorCode=${result.errorCode} jobId=${result.jobId} versionId=${result.versionId}`,
          );
        }
        if (result.jobStatus === FAILED_JOB_STATUS) {
          setHasGenerationFailed(true);
        }
      })
      .catch((error) => {
        if (__DEV__) {
          console.log(
            `[ep${episodeNumber}] generations 요청 실패 status=${axios.isAxiosError(error) ? error.response?.status : '?'}`,
            axios.isAxiosError(error) ? error.response?.data : error,
          );
        }
        setHasGenerationFailed(true);
      });
  }

  useEffect(() => {
    const isReady = query.data != null && isEpisodeFullyGenerated(episodeNumber, query.data.messages);

    if (__DEV__) {
      console.log(
        `[ep${episodeNumber}] effect: isSuccess=${query.isSuccess} isReady=${isReady} hasRequested=${hasRequestedGeneration.current}`,
      );
    }

    if (query.isSuccess && !isReady && !hasRequestedGeneration.current && !isPastSeason) {
      triggerGeneration();
    }
  }, [query.data, query.isSuccess, episodeNumber, isPastSeason]);

  /** "다시 시도". 실패 표시를 내리고 생성을 다시 요청한다. */
  function retryGeneration() {
    setHasGenerationFailed(false);
    triggerGeneration();
  }

  return { ...query, hasGenerationFailed, retryGeneration };
}
