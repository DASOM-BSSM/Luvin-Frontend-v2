import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import axios from 'axios';

import { getEpisodeMessages, requestEpisodeGeneration } from '@/src/features/inferno/api/ai-season';
import type { AiEpisodeMessagesView } from '@/src/features/inferno/api/ai-season-types';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import { useAuthStore } from '@/src/features/auth/store/auth-store';

/** AI 생성이 아직 안 끝났을 때 다시 확인하는 간격. */
const GENERATION_POLL_MS = 3000;

/**
 * `GET .../episodes/{number}`는 이 회차의 generation 을 아직 한 번도 요청 안 했으면
 * 200+빈 배열이 아니라 **409**를 준다(백엔드 확인: "1화 generation이 아직 접수되지
 * 않았습니다"). 이걸 실패로 취급하면 아래 폴링/생성 요청 로직이 둘 다 안 걸리므로,
 * 여기서 흡수해서 "아직 없음"(null)으로 정규화한다 — 그 외 에러(네트워크/서버 오류 등)는
 * 그대로 던져서 기존 에러 처리가 그대로 동작하게 둔다.
 */
async function fetchEpisodeMessagesOrNull(episodeNumber: number): Promise<AiEpisodeMessagesView | null> {
  try {
    return await getEpisodeMessages(episodeNumber);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return null;
    }

    throw error;
  }
}

/**
 * 회차 메시지. 아직 생성 전이면(409 → null, 또는 200+빈 배열) 생성을 한 번 요청하고,
 * 다 만들어질 때까지 짧게 폴링한다 — 생성 상태만 따로 조회하는 엔드포인트가 없어서
 * `GET .../episodes/{number}` 자체를 반복 호출해 확인하는 방식이다.
 */
export default function useAiEpisodeMessages(episodeNumber: number, enabled = true) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasRequestedGeneration = useRef(false);

  const query = useQuery({
    queryKey: aiSeasonKeys.episode(episodeNumber),
    queryFn: () => fetchEpisodeMessagesOrNull(episodeNumber),
    enabled: isAuthenticated && enabled,
    refetchInterval: (currentQuery) => {
      const data = currentQuery.state.data;
      return data === null || (data && data.messages.length === 0) ? GENERATION_POLL_MS : false;
    },
  });

  useEffect(() => {
    const isNotGeneratedYet = query.data === null || (query.data && query.data.messages.length === 0);

    if (query.isSuccess && isNotGeneratedYet && !hasRequestedGeneration.current) {
      hasRequestedGeneration.current = true;
      requestEpisodeGeneration(episodeNumber);
    }
  }, [query.data, query.isSuccess, episodeNumber]);

  return query;
}
